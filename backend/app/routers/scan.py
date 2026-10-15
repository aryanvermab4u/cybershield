import json
import re
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.database import get_db
from backend.app.models import ScanRecord
from backend.app.schemas import (
    UniversalScanRequest, PhoneScanRequest, EmailScanRequest,
    MessageScanRequest, UrlScanRequest, PaymentScanRequest,
    QrScanRequest, AttachmentScanRequest, ScanResult
)
from backend.app.engine import (
    analyze_phone_number, analyze_email, analyze_message,
    analyze_url, analyze_payment, RiskEngine, RiskFactor
)

router = APIRouter(prefix="/api/scan", tags=["Scanning Engines"])

async def persist_scan(result: ScanResult, db: AsyncSession) -> ScanResult:
    record = ScanRecord(
        scan_type=result.scan_type,
        input_preview=result.input_preview,
        risk_score=result.risk_score,
        risk_level=result.risk_level,
        confidence=result.confidence,
        evidence_quality=result.evidence_quality,
        summary=result.overall_assessment,
        categories=json.dumps(result.categories),
        warning_signs=json.dumps(result.warning_signs),
        reasons=json.dumps(result.reasons),
        legitimate_explanations=json.dumps(result.legitimate_explanations),
        missing_evidence=json.dumps(result.missing_evidence),
        safe_actions=json.dumps(result.safe_next_actions),
        origin_intelligence=json.dumps(result.origin_intelligence or {})
    )
    db.add(record)
    await db.commit()
    await db.refresh(record)
    result.id = record.id
    return result

@router.post("/phone", response_model=ScanResult)
async def scan_phone(req: PhoneScanRequest, db: AsyncSession = Depends(get_db)):
    result = analyze_phone_number(req.phone_number, req.call_description)
    if req.save_history:
        result = await persist_scan(result, db)
    return result

@router.post("/email", response_model=ScanResult)
async def scan_email(req: EmailScanRequest, db: AsyncSession = Depends(get_db)):
    result = analyze_email(
        sender_email=req.sender_email,
        display_name=req.display_name,
        subject=req.subject,
        body=req.body,
        reply_to=req.reply_to,
        raw_headers=req.raw_headers
    )
    if req.save_history:
        result = await persist_scan(result, db)
    return result

@router.post("/message", response_model=ScanResult)
async def scan_message(req: MessageScanRequest, db: AsyncSession = Depends(get_db)):
    result = analyze_message(
        message_text=req.message_text,
        platform=req.platform,
        sender_id=req.sender_id
    )
    if req.save_history:
        result = await persist_scan(result, db)
    return result

@router.post("/url", response_model=ScanResult)
async def scan_url(req: UrlScanRequest, db: AsyncSession = Depends(get_db)):
    result = await analyze_url(req.url, req.follow_redirects)
    if req.save_history:
        result = await persist_scan(result, db)
    return result

@router.post("/payment", response_model=ScanResult)
async def scan_payment(req: PaymentScanRequest, db: AsyncSession = Depends(get_db)):
    result = analyze_payment(
        upi_id=req.upi_id,
        payment_text=req.payment_text,
        amount=req.amount
    )
    if req.save_history:
        result = await persist_scan(result, db)
    return result

@router.post("/qr", response_model=ScanResult)
async def scan_qr(req: QrScanRequest, db: AsyncSession = Depends(get_db)):
    content = req.decoded_content.strip()
    
    # Check if QR decoded to a URL
    if content.startswith(("http://", "https://", "www.")) or "." in content and not "@" in content:
        result = await analyze_url(content)
        result.scan_type = "qr"
        result.categories.append("QR Destination URL")
    # Check if QR decoded to a UPI intent string (e.g. upi://pay?pa=...)
    elif content.startswith("upi://pay"):
        pa_match = re.search(r"pa=([^&]+)", content)
        upi_vpa = pa_match.group(1) if pa_match else None
        result = analyze_payment(upi_id=upi_vpa, payment_text=content)
        result.scan_type = "qr"
        result.categories.append("QR UPI Intent")
    else:
        result = analyze_message(message_text=content, platform="qr")
        result.scan_type = "qr"
        result.categories.append("QR Text Payload")

    result.reasons.append("Notice: QR code was safely decoded into text without automatically opening or navigating to the target.")
    if req.save_history:
        result = await persist_scan(result, db)
    return result

@router.post("/attachment", response_model=ScanResult)
async def scan_attachment(req: AttachmentScanRequest, db: AsyncSession = Depends(get_db)):
    filename = req.filename.strip().lower()
    factors: list[RiskFactor] = []
    matched_categories: set[str] = set()

    # Double extension attack: invoice.pdf.exe
    if re.search(r"\.(pdf|docx|xlsx|jpg|png)\.(exe|bat|vbs|scr|cmd|ps1|iso|jar)$", filename):
        factors.append(RiskFactor(
            name="Double Extension Deception (.pdf.exe)",
            weight=50,
            description=f"File '{filename}' uses a deceptive double file extension to disguise an executable payload as an innocent document.",
            category="Malicious Payload",
            evidence=filename
        ))
        matched_categories.add("Double Extension")

    # High-risk executable / script extension
    high_risk_exts = [".exe", ".scr", ".bat", ".vbs", ".cmd", ".ps1", ".iso", ".jar", ".msi", ".apk"]
    for ext in high_risk_exts:
        if filename.endswith(ext):
            factors.append(RiskFactor(
                name=f"High-Risk Executable Extension ({ext})",
                weight=45,
                description=f"Direct delivery of executable format '{ext}' in email or messaging is the primary vector for ransomware and trojans.",
                category="Executable Payload",
                evidence=ext
            ))
            matched_categories.add("Executable")
            break

    # Macro-enabled office documents
    if filename.endswith((".docm", ".xlsm", ".pptm")):
        factors.append(RiskFactor(
            name="Macro-Enabled Document Format",
            weight=35,
            description=f"File extension '{filename}' indicates embedded VBA macros, which can execute unauthorized code upon opening.",
            category="Office Macro",
            evidence=filename
        ))
        matched_categories.add("Macro Document")

    score, level, confidence, quality = RiskEngine.calculate_score(factors, base_score=5)
    categories_list = list(matched_categories) if matched_categories else ["Attachment Metadata Inspection"]
    reasons = [f.description for f in factors]
    warning_signs = [f.name for f in factors if f.weight >= 30]

    reasons.append("CyberShield inspects file metadata and headers safely without executing arbitrary files.")
    safe_actions = RiskEngine.build_safe_actions(level, "attachment", categories_list)

    result = ScanResult(
        scan_type="attachment",
        input_preview=filename,
        risk_score=score,
        risk_level=level,
        confidence=confidence,
        evidence_quality=quality,
        overall_assessment=(
            f"Attachment metadata for '{filename}' analyzed. "
            f"{'High risk of executable or malicious payload detected.' if score >= 50 else 'Standard document or media extension.'}"
        ),
        categories=categories_list,
        warning_signs=warning_signs,
        reasons=reasons,
        legitimate_explanations=["Corporate administrators occasionally distribute signed installation packages."],
        missing_evidence=["File hash was not compared against antivirus signature databases."],
        safe_next_actions=safe_actions,
        origin_intelligence={
            "item_type": "attachment",
            "identified_entity": filename,
            "source": "Safe File Metadata Inspection Engine",
            "is_approximate": False,
            "is_verified": False,
            "confidence": 0.85,
            "limitations": [
                "Full file contents were not executed in an isolated dynamic sandbox.",
                "Zero-day exploits inside legitimate PDF readers cannot be ruled out purely by filename."
            ],
            "notes": "Metadata verification executed safely without executing downloaded binaries."
        }
    )
    if req.save_history:
        result = await persist_scan(result, db)
    return result

@router.post("/universal", response_model=ScanResult)
async def scan_universal(req: UniversalScanRequest, db: AsyncSession = Depends(get_db)):
    content = req.content.strip()
    hint = (req.scan_hint or "auto").lower()

    # Automatic input type classification if hint is 'auto'
    if hint == "auto":
        # 1. URL pattern
        if re.match(r"^(https?://|www\.)[^\s]+", content) or (
            len(content.split()) == 1 and re.match(r"^[a-zA-Z0-9\-]+\.[a-zA-Z]{2,}(/.*)?$", content)
        ):
            hint = "url"
        # 2. Email pattern
        elif re.match(r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$", content):
            hint = "email"
        # 3. UPI ID pattern (e.g. name@okhdfcbank, mobile@paytm)
        elif "@" in content and len(content.split()) == 1 and not "." in content.split("@")[1]:
            hint = "payment"
        # 4. Phone number
        elif re.match(r"^(\+?91|0)?[6-9]\d{9}$", re.sub(r"[\s\-]", "", content)):
            hint = "phone"
        # 5. Raw email headers
        elif "received:" in content.lower() and ("from:" in content.lower() or "authentication-results:" in content.lower()):
            hint = "email"
        else:
            hint = "message"

    # Route to engine
    if hint == "phone":
        result = analyze_phone_number(content, req.context_description)
    elif hint == "email":
        if "received:" in content.lower():
            # Raw header text
            sender_match = re.search(r"^from:\s*(.+)$", content, re.MULTILINE | re.IGNORECASE)
            sender = sender_match.group(1).strip() if sender_match else "header-check@domain.com"
            result = analyze_email(sender_email=sender, raw_headers=content)
        else:
            result = analyze_email(sender_email=content, body=req.context_description)
    elif hint == "url":
        result = await analyze_url(content)
    elif hint == "payment":
        result = analyze_payment(upi_id=content, payment_text=req.context_description)
    elif hint == "qr":
        # Safe QR destination
        result = await analyze_url(content)
        result.scan_type = "qr"
    else:
        # Default to multilingual message analyzer
        result = analyze_message(message_text=content)

    if req.save_history:
        result = await persist_scan(result, db)
    return result
