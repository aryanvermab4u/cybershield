import re
from typing import Optional
from backend.app.engine.risk_calculator import RiskEngine, RiskFactor
from backend.app.schemas import ScanResult

COMMON_UPI_HANDLES = {
    "okhdfcbank": "Google Pay (HDFC Bank)",
    "okaxis": "Google Pay (Axis Bank)",
    "oksbi": "Google Pay (State Bank of India)",
    "okicici": "Google Pay (ICICI Bank)",
    "ybl": "PhonePe (Yes Bank)",
    "ibl": "PhonePe (IndusInd Bank)",
    "axl": "PhonePe (Axis Bank)",
    "paytm": "Paytm Payments Bank / VPA",
    "apl": "Amazon Pay (Axis Bank)",
    "upi": "BHIM / NPCI Official",
    "barodampay": "Bank of Baroda",
    "pnb": "Punjab National Bank",
    "cnrb": "Canara Bank"
}

def analyze_payment(
    upi_id: Optional[str] = None,
    payment_text: Optional[str] = None,
    amount: Optional[float] = None
) -> ScanResult:
    factors: list[RiskFactor] = []
    matched_categories: set[str] = set()

    clean_upi = (upi_id or "").strip().lower()
    combined_text = f"{clean_upi} {payment_text or ''}".lower()

    # 1. UPI ID Format Validation
    is_valid_format = False
    handle_info = "Unknown / Custom PSP Handle"
    if clean_upi:
        if "@" in clean_upi:
            username, handle = clean_upi.split("@", 1)
            if re.match(r"^[a-zA-Z0-9.\-_]{2,64}$", username) and re.match(r"^[a-zA-Z0-9]{2,32}$", handle):
                is_valid_format = True
                if handle in COMMON_UPI_HANDLES:
                    handle_info = COMMON_UPI_HANDLES[handle]
            else:
                factors.append(RiskFactor(
                    name="Invalid UPI Syntax",
                    weight=30,
                    description=f"'{clean_upi}' does not adhere to standard NPCI Virtual Payment Address (VPA) character constraints.",
                    category="Identifier Syntax"
                ))
        else:
            factors.append(RiskFactor(
                name="Missing UPI Handle (@)",
                weight=35,
                description="A valid UPI ID must include a '@' symbol separating the username and Payment Service Provider (e.g., name@okhdfcbank).",
                category="Identifier Syntax"
            ))

    # 2. Critical Scam: "Enter PIN to Receive Money"
    pin_receive_patterns = [
        r"enter.*pin.*to.*receive",
        r"enter.*pin.*to.*claim",
        r"enter.*pin.*for.*cashback",
        r"pin.*daalo.*paise.*aayenge",
        r"receive money.*enter.*pin"
    ]
    for pat in pin_receive_patterns:
        if re.search(pat, combined_text):
            factors.append(RiskFactor(
                name="Deadly UPI 'PIN-to-Receive' Trap",
                weight=65,
                description=(
                    "CRITICAL FRAUD SIGN: Instructions state you must enter your UPI PIN to receive money or rewards. "
                    "In the UPI architecture, your PIN is EXCLUSIVELY required to AUTHORIZE DEBITS. You NEVER need to enter a PIN to receive money!"
                ),
                category="Payment Mechanics Deception",
                evidence=pat
            ))
            matched_categories.add("PIN-to-Receive Trap")
            break

    # 3. Collect Request Deception
    collect_patterns = [
        r"collect request",
        r"approve request.*to get refund",
        r"accept request.*in phonepe|gpay|paytm",
        r"request.*approved.*transfer"
    ]
    for pat in collect_patterns:
        if re.search(pat, combined_text):
            factors.append(RiskFactor(
                name="Collect Request Deception",
                weight=45,
                description="Victim is sent a UPI 'Collect Request' disguised as a refund or cashback approval. Approving a collect request immediately deducts funds.",
                category="Collect Request Fraud",
                evidence=pat
            ))
            matched_categories.add("Collect Request Fraud")
            break

    # 4. Advance Fee & Refund Traps
    advance_fee_patterns = [
        r"advance.*(fee|charge|deposit|processing fee)",
        r"pay rs\.?\s*\d+.*to unlock",
        r"security deposit.*refundable",
        r"file charge.*loan"
    ]
    for pat in advance_fee_patterns:
        if re.search(pat, combined_text):
            factors.append(RiskFactor(
                name="Advance Fee / Loan Processing Extortion",
                weight=42,
                description="Payment requested as an advance fee or deposit to release a prize, job, or loan approval.",
                category="Advance Fee Fraud",
                evidence=pat
            ))
            matched_categories.add("Advance Fee Scam")
            break

    # 5. High-Risk or Impersonated Keywords in UPI Username
    if clean_upi:
        impersonated_handles = ["support", "refund", "helpline", "official", "care", "customer", "discom", "police"]
        for kw in impersonated_handles:
            if kw in clean_upi.split("@")[0]:
                factors.append(RiskFactor(
                    name=f"Keyword Impersonation in UPI Handle ('{kw}')",
                    weight=38,
                    description=f"The UPI ID contains '{kw}', commonly created on personal accounts by scammers to appear as official support desks.",
                    category="VPA Impersonation",
                    evidence=clean_upi
                ))
                matched_categories.add("VPA Impersonation")
                break

    score, level, confidence, quality = RiskEngine.calculate_score(factors, base_score=10)
    categories_list = list(matched_categories) if matched_categories else ["UPI Payment Safety"]
    reasons = [f.description for f in factors]
    warning_signs = [f.name for f in factors if f.weight >= 30]

    # Syntactic validity disclaimer
    reasons.append(
        "Important Note: A syntactically valid UPI ID does NOT prove the account owner is trustworthy. "
        "Any individual can create a VPA through banking applications without verified merchant vetting."
    )

    safe_actions = RiskEngine.build_safe_actions(level, "payment", categories_list)
    legitimate_explanations = [
        "Peer-to-peer personal transfers often use personal mobile numbers as VPA usernames.",
        "Some legitimate merchants generate automated collect requests when a customer initiates an online purchase."
    ]

    origin_intel = {
        "item_type": "payment",
        "identified_entity": clean_upi or "Payment Request Text",
        "vpa_format_valid": is_valid_format,
        "psp_handle_mapping": handle_info,
        "source": "NPCI UPI Specifications & Fraud Heuristics",
        "is_approximate": True,
        "is_verified": False,
        "confidence": confidence,
        "limitations": [
            "NPCI beneficiary account owner name is only queried during live banking bank-to-bank settlement.",
            "CyberShield never initiates financial transactions or accesses private bank databases."
        ],
        "notes": "Evaluation performed strictly on VPA metadata, request text semantics, and fraud heuristics."
    }

    preview = clean_upi if clean_upi else (payment_text[:60] if payment_text else "Payment Request")
    return ScanResult(
        scan_type="payment",
        input_preview=preview,
        risk_score=score,
        risk_level=level,
        confidence=confidence,
        evidence_quality=quality,
        overall_assessment=(
            f"Payment instructions evaluated ({handle_info}). "
            f"{'High risk of financial fraud or collect request deception.' if score >= 50 else 'Standard payment parameters. Always double-check recipient details before approving.'}"
        ),
        categories=categories_list,
        warning_signs=warning_signs,
        reasons=reasons,
        legitimate_explanations=legitimate_explanations,
        missing_evidence=[
            "Beneficiary legal registered name requires live NPCI banking integration."
        ],
        safe_next_actions=safe_actions,
        origin_intelligence=origin_intel
    )
