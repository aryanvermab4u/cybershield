import re
from typing import Optional
from backend.app.engine.risk_calculator import RiskEngine, RiskFactor
from backend.app.schemas import ScanResult

MESSAGE_RULES = [
    # 1. Electricity Disconnection (English, Hindi, Hinglish, Marathi)
    {
        "category": "Electricity Bill Disconnection Scam",
        "patterns": [
            r"electricity (bill|power|connection) (will be|is) disconnected",
            r"(tonight|today) at 9[:\.]30\s*(pm|baje)?",
            r"bijli (connection|bill) (kat diya jayega|kaat diya jayega|rok di jayegi)",
            r"vij bill baki ahe.*line cut karnyaat yeil",
            r"contact electricity officer \d{10}",
            r"call officer at \+?91\d{10}",
            r"विद्युत|बिजली बिल|महावितरण"
        ],
        "weight": 48,
        "warning": "Power disconnection urgency with unauthorized personal officer number."
    },
    # 2. Fake Bank KYC / Account Block (English, Hinglish, Marathi)
    {
        "category": "Fake Bank KYC & Account Block",
        "patterns": [
            r"(sbi|hdfc|icici|axis|pnb|kotak|canara).*(account|yono|netbanking).*(blocked|suspended|deactivated)",
            r"pan card (not updated|not linked|expired)",
            r"update your kyc (immediately|within 24 hours)",
            r"click here to unblock.*http",
            r"aapka khata band kar diya gaya hai",
            r"tumche bank account band jhale ahe",
            r"apna kyc update karein",
            r"खाता बंद|केवाईसी अपडेट|पैन कार्ड लिंक"
        ],
        "weight": 46,
        "warning": "Bank account suspension threat demanding urgent external KYC link."
    },
    # 3. Work from Home / Telegram Task Scams
    {
        "category": "Part-Time Task & Telegram Job Scam",
        "patterns": [
            r"(part time|work from home|online job).*(earn|salary).*(3000|5000|8000|10000|daily)",
            r"like (youtube|instagram|google maps) (videos|reviews)",
            r"telegram task|join telegram group.*earn",
            r"prepaid task|deposit 1000 get 1500",
            r"ghar baithe kamayein \d+ hazar",
            r"दररोज 3000 ते 5000 कमवा",
            r"घर बैठे पैसे कमाए"
        ],
        "weight": 44,
        "warning": "Part-time video/task scam promising unrealistic daily returns via Telegram."
    },
    # 4. Digital Arrest & Police Impersonation
    {
        "category": "Digital Arrest / Police Impersonation",
        "patterns": [
            r"digital arrest|arrest warrant issued",
            r"(cbi|delhi police|mumbai police|crime branch|ed).*(notice|investigation|enquiry)",
            r"parcel (contains|seized with) (drugs|contraband|narcotics|passports)",
            r"video call enquiry.*skype",
            r"police case registered against your aadhaar",
            r"डिजिटल अरेस्ट|गिरफ्तारी वारंट|नारकोटिक्स"
        ],
        "weight": 50,
        "warning": "Fabricated law enforcement arrest threat or contraband parcel claim."
    },
    # 5. Traffic Challan APK Trap
    {
        "category": "Fake Traffic Challan & Malicious APK",
        "patterns": [
            r"(traffic challan|echallan|parivahan).*(pending|overdue|court)",
            r"download (challan|parivahan).*(apk|app)",
            r"challan notice no \d+.*pay immediately"
        ],
        "weight": 46,
        "warning": "Fake traffic challan notice attempting to trick user into downloading an APK."
    },
    # 6. Delivery Fee / Courier Parcel
    {
        "category": "Fake Courier / Parcel Fee Scam",
        "patterns": [
            r"(india post|speed post|fedex|bluedart).*(package|parcel).*(held|cannot be delivered|address incomplete)",
            r"pay (small fee|delivery charge|re-delivery fee|rs \d+)",
            r"update address.*http"
        ],
        "weight": 40,
        "warning": "Undelivered parcel notification demanding small fee via malicious link."
    },
    # 7. UPI / QR Scan Trap
    {
        "category": "UPI / QR Code Fraud Trap",
        "patterns": [
            r"scan qr code to receive",
            r"enter upi pin to claim (cashback|reward|refund)",
            r"receive money enter pin",
            r"paisa lene ke liye pin dalein",
            r"पिन दर्ज करके पैसे प्राप्त करें"
        ],
        "weight": 48,
        "warning": "Claims entering UPI PIN or scanning QR code receives money (dangerous lie)."
    },
    # 8. Remote Access Support Deception
    {
        "category": "Remote Access Tool Scam",
        "patterns": [
            r"install (anydesk|teamviewer|rustdesk|quicksupport)",
            r"share 9 digit code",
            r"screen share application"
        ],
        "weight": 45,
        "warning": "Urges victim to install remote desktop control software."
    },
    # 9. Free Recharge / Unrealistic Shopping Deals
    {
        "category": "Fake Deals & Free Recharge Lures",
        "patterns": [
            r"(free recharge|free mobile recharge).*(jio|airtel|vi).*(month|year)",
            r"iphone 15.*(999|1999|free)",
            r"government subsidy.*click link.*claim"
        ],
        "weight": 35,
        "warning": "Unrealistic viral offer or giveaway designed for credential/data harvesting."
    }
]

def analyze_message(message_text: str, platform: str = "sms", sender_id: Optional[str] = None) -> ScanResult:
    text_lower = message_text.lower()
    factors: list[RiskFactor] = []
    matched_categories: set[str] = set()

    # Scan through rules
    for rule in MESSAGE_RULES:
        for pat in rule["patterns"]:
            match = re.search(pat, text_lower)
            if match:
                matched_span = match.group(0)
                factors.append(RiskFactor(
                    name=rule["category"],
                    weight=rule["weight"],
                    description=f"Message matches {rule['category']}: \"{matched_span}\". {rule['warning']}",
                    category=rule["category"],
                    evidence=matched_span
                ))
                matched_categories.add(rule["category"])
                break

    # Link / URL detection in message
    urls_found = re.findall(r"https?://[^\s]+|www\.[^\s]+|[a-zA-Z0-9\-]+\.(xyz|top|club|link|live|buzz|site|icu|work)[/\w\-]*", message_text)
    if urls_found:
        factors.append(RiskFactor(
            name="Embedded URL in Unsolicited Message",
            weight=25,
            description=f"Message contains external link ({len(urls_found)} found). Cybercriminals use embedded links to route to phishing pages or APK downloads.",
            category="Embedded Links",
            evidence=str(urls_found[0])
        ))
        matched_categories.add("Embedded Links")

    # Shortened URL detection (bit.ly, tinyurl, etc.)
    if re.search(r"(bit\.ly|tinyurl\.com|is\.gd|t\.co|cutt\.ly|rb\.gy)", text_lower):
        factors.append(RiskFactor(
            name="Obfuscated / Shortened URL",
            weight=30,
            description="Message utilizes a URL shortener which conceals the ultimate landing destination.",
            category="Obfuscated Links",
            evidence="Shortened link detected"
        ))
        matched_categories.add("URL Shortener")

    # APK file mention
    if re.search(r"\.apk\b", text_lower):
        factors.append(RiskFactor(
            name="Direct Android Application Package (.APK) Prompt",
            weight=45,
            description="Message prompts the installation of an APK file outside of the official Google Play Store, the primary vehicle for banking trojans.",
            category="Malware / APK",
            evidence=".apk prompt"
        ))
        matched_categories.add("Malicious APK")

    # Evaluate sender ID if provided (e.g., TRAI DLT format)
    sender_analysis = "Standard sender"
    if sender_id:
        cleaned_sender = sender_id.strip().upper()
        # TRAI header format: 6 alphabetic characters with optional 2-char prefix, e.g. "AD-SBINB"
        if re.match(r"^[A-Z]{2}\-[A-Z]{6}$", cleaned_sender):
            sender_analysis = f"Registered Indian DLT Header format: {cleaned_sender}"
        elif re.match(r"^\+?91[6-9]\d{9}$", cleaned_sender) or (len(cleaned_sender) == 10 and cleaned_sender.isdigit()):
            # Using 10-digit mobile number for corporate alerts is a massive red flag in India
            factors.append(RiskFactor(
                name="Personal Mobile Number Used for Corporate / Institutional Alert",
                weight=35,
                description=f"Message sent from a standard 10-digit mobile number ({cleaned_sender}). Legitimate Indian banks and utilities are legally required by TRAI to send transactional alerts via registered 6-character alphabetic headers, NEVER personal mobile SIMs.",
                category="Sender ID Verification",
                evidence=cleaned_sender
            ))
            matched_categories.add("Unauthorized Sender ID")

    score, level, confidence, quality = RiskEngine.calculate_score(factors, base_score=8)
    categories_list = list(matched_categories) if matched_categories else ["Message Safety Evaluation"]
    reasons = [f.description for f in factors]
    warning_signs = [f.name for f in factors if f.weight >= 30]

    safe_actions = RiskEngine.build_safe_actions(level, "message", categories_list)
    legitimate_explanations = RiskEngine.build_legitimate_explanations("message", factors)

    origin_intel = {
        "item_type": "message",
        "identified_entity": sender_id or "Direct Text Paste",
        "platform": platform,
        "source": "TRAI DLT Registry Specification & Heuristic Linguistic Engine",
        "is_approximate": True,
        "is_verified": False,
        "confidence": confidence,
        "sender_id_status": sender_analysis,
        "limitations": [
            "SMS content is delivered without cryptographic end-to-end provenance.",
            "WhatsApp & Telegram account numbers may be registered with virtual/compromised SIMs."
        ],
        "notes": "Multilingual analysis executed across English, Hindi, Hinglish, and Marathi syntax models."
    }

    return ScanResult(
        scan_type="message",
        input_preview=message_text[:80] + ("..." if len(message_text) > 80 else ""),
        risk_score=score,
        risk_level=level,
        confidence=confidence,
        evidence_quality=quality,
        overall_assessment=(
            f"Message analyzed across {len(factors)} detected risk vectors. "
            f"{'High confidence fraud indicators detected.' if score >= 50 else 'Lower or cautionary indicators. Exercise vigilance with unsolicited requests.'}"
        ),
        categories=categories_list,
        warning_signs=warning_signs,
        reasons=reasons,
        legitimate_explanations=legitimate_explanations,
        missing_evidence=[
            "Full carrier transmission logs are not available for client-side text scans."
        ],
        safe_next_actions=safe_actions,
        origin_intelligence=origin_intel
    )
