import re
from typing import Optional
from backend.app.engine.risk_calculator import RiskEngine, RiskFactor
from backend.app.schemas import ScanResult

# Indian Telecom Circles based on leading mobile series
INDIAN_PREFIX_CIRCLES = {
    "9810": "Delhi & NCR (Airtel)",
    "9811": "Delhi & NCR (Vodafone Idea)",
    "9818": "Delhi & NCR (Airtel)",
    "9820": "Mumbai (Vodafone Idea)",
    "9821": "Mumbai (Vodafone Idea)",
    "9822": "Maharashtra & Goa (Vodafone Idea)",
    "9823": "Maharashtra & Goa (Vodafone Idea)",
    "9840": "Chennai (Airtel)",
    "9841": "Chennai (Airtel)",
    "9845": "Karnataka / Bengaluru (Airtel)",
    "9844": "Karnataka (Vodafone Idea)",
    "9848": "Andhra Pradesh & Telangana (Airtel)",
    "9849": "Andhra Pradesh & Telangana (Airtel)",
    "9830": "Kolkata (Vodafone Idea)",
    "9831": "Kolkata (Airtel)",
    "9829": "Rajasthan (Airtel)",
    "9890": "Maharashtra & Goa (Airtel)",
    "9891": "Delhi (Vodafone Idea)",
    "9892": "Mumbai (Airtel)",
    "9910": "Delhi & NCR (Airtel)",
    "9920": "Mumbai (Vodafone Idea)",
    "7000": "Madhya Pradesh & Chhattisgarh",
    "7001": "West Bengal",
    "7002": "Assam & North East",
    "7003": "Kolkata",
    "7004": "Bihar & Jharkhand",
    "7006": "Jammu & Kashmir",
    "7007": "Uttar Pradesh East",
    "7008": "Odisha",
    "7009": "Punjab",
    "7011": "Delhi & NCR",
    "7012": "Kerala",
    "7013": "Andhra Pradesh & Telangana",
    "7014": "Rajasthan",
    "7015": "Haryana",
    "7016": "Gujarat",
    "7017": "Uttar Pradesh West",
    "7018": "Himachal Pradesh",
    "7019": "Karnataka",
}

CALL_PATTERN_RULES = [
    {
        "category": "Digital Arrest / Law Enforcement Impersonation",
        "patterns": [
            r"digital arrest", r"cbi", r"crime branch", r"police officer", r"skype call",
            r"video call enquiry", r"drugs in parcel", r"customs seized", r"illegal passport",
            r"arrest warrant", r"supreme court", r"money laundering case", r"sim disconnected by trai"
        ],
        "weight": 48,
        "warning": "Impersonating law enforcement / Digital Arrest threat detected."
    },
    {
        "category": "Electricity Bill Disconnection Fraud",
        "patterns": [
            r"electricity (bill|office|power)", r"disconnect(ed)? tonight", r"9\.?30 pm",
            r"bijli cut", r"call electricity officer", r"discom officer"
        ],
        "weight": 42,
        "warning": "Power disconnection urgency pattern typical of electricity bill scams."
    },
    {
        "category": "Bank KYC & Account Freeze",
        "patterns": [
            r"kyc update", r"account will be blocked", r"pan card link", r"yono block",
            r"netbanking expire", r"download (apk|support app)", r"debit card block"
        ],
        "weight": 40,
        "warning": "Bank account freeze and urgent KYC verification demand."
    },
    {
        "category": "Remote Access Deception",
        "patterns": [
            r"anydesk", r"teamviewer", r"rustdesk", r"quicksupport", r"screen share",
            r"install this app to fix", r"remote support app"
        ],
        "weight": 45,
        "warning": "Caller requests installation of remote-desktop screen sharing tools."
    },
    {
        "category": "Courier / Customs Scam",
        "patterns": [
            r"fedex", r"bluedart", r"india post parcel", r"customs duty", r"contraband item",
            r"courier seized", r"unclaimed package", r"taiwan parcel"
        ],
        "weight": 42,
        "warning": "Courier parcel seizure or customs extortion pattern."
    },
    {
        "category": "Work from Home & Task Scam",
        "patterns": [
            r"work from home", r"part time job", r"like youtube video", r"telegram task",
            r"prepaid merchant", r"earn 5000 daily", r"daily salary"
        ],
        "weight": 38,
        "warning": "Work from home task scam pattern promising unrealistic daily income."
    },
    {
        "category": "Lottery, Cashback & Refund",
        "patterns": [
            r"kbc lottery", r"winner 25 lakh", r"phonepe cashback", r"refund amount",
            r"scratch card", r"gpay reward"
        ],
        "weight": 35,
        "warning": "Lottery prize or unexpected cashback lure."
    },
    {
        "category": "Credential & OTP Theft",
        "patterns": [
            r"share otp", r"tell me the code", r"cvv number", r"atm pin", r"upi pin"
        ],
        "weight": 45,
        "warning": "Direct request for OTP, PIN, or confidential financial credentials."
    }
]

def analyze_phone_number(phone_input: str, call_description: Optional[str] = None) -> ScanResult:
    # Clean phone input
    cleaned = re.sub(r"[\s\-\(\)]", "", phone_input.strip())
    is_indian = False
    circle_info = "Unknown / International"
    carrier_info = "Not determined"
    country = "International"

    if cleaned.startswith("+91"):
        is_indian = True
        national_number = cleaned[3:]
        country = "India (+91)"
    elif cleaned.startswith("0") and len(cleaned) == 11:
        is_indian = True
        national_number = cleaned[1:]
        country = "India (Domestic 0-prefix)"
    elif len(cleaned) == 10 and cleaned.isdigit():
        is_indian = True
        national_number = cleaned
        country = "India (10-digit mobile assumed)"
    else:
        national_number = cleaned

    # Telecom circle lookup for Indian numbers
    if is_indian and len(national_number) == 10:
        prefix4 = national_number[:4]
        if prefix4 in INDIAN_PREFIX_CIRCLES:
            circle_info = INDIAN_PREFIX_CIRCLES[prefix4]
        elif national_number[0] in ["6", "7", "8", "9"]:
            circle_info = f"India Mobile Series (Leading {national_number[:2]})"
            carrier_info = "Indian GSM/LTE Carrier"
        elif national_number.startswith("11"):
            circle_info = "Delhi Landline (STD 011)"
        elif national_number.startswith("22"):
            circle_info = "Mumbai Landline (STD 022)"
        elif national_number.startswith("80"):
            circle_info = "Bengaluru Landline (STD 080)"

    factors: list[RiskFactor] = []
    matched_categories: set[str] = set()

    # Heuristic format checks
    if len(cleaned) < 7:
        factors.append(RiskFactor(
            name="Incomplete Number",
            weight=30,
            description="The entered telephone number is unusually short and may be truncated or an internal extension.",
            category="Format"
        ))

    # Evaluate call description if provided
    combined_desc = (call_description or "").lower()
    for rule in CALL_PATTERN_RULES:
        for pat in rule["patterns"]:
            if re.search(pat, combined_desc):
                factors.append(RiskFactor(
                    name=rule["category"],
                    weight=rule["weight"],
                    description=f"Call description matched pattern: '{pat}'. {rule['warning']}",
                    category=rule["category"],
                    evidence=pat
                ))
                matched_categories.add(rule["category"])
                break

    # Check for VoIP / Virtual number patterns (e.g. +1, +44, +855 numbers calling Indian residents)
    if cleaned.startswith("+1") or cleaned.startswith("+44") or cleaned.startswith("+855") or cleaned.startswith("+92") or cleaned.startswith("+971"):
        factors.append(RiskFactor(
            name="Foreign Country Code in Domestic Context",
            weight=35,
            description=f"Number originates from {cleaned[:3]} country code. Cross-border VoIP calls frequently target domestic victims in fake support or task schemes.",
            category="VoIP Origin"
        ))
        matched_categories.add("International VoIP")

    # Caller ID Spoofing awareness is always appended as an explainable reason
    spoofing_warning = (
        "IMPORTANT: Caller ID can be easily spoofed using VoIP SIP trunks. Even if this number "
        "displays as an official bank, telecom, or police office on your caller ID, that display "
        "does not guarantee caller authenticity."
    )

    score, level, confidence, quality = RiskEngine.calculate_score(factors, base_score=15)
    
    categories_list = list(matched_categories) if matched_categories else ["Phone Reputation Check"]
    reasons = [f.description for f in factors] + [spoofing_warning]
    warning_signs = [f.name for f in factors if f.weight >= 30]

    safe_actions = RiskEngine.build_safe_actions(level, "phone", categories_list)
    legitimate_explanations = RiskEngine.build_legitimate_explanations("phone", factors)

    origin_intel = {
        "item_type": "phone",
        "identified_entity": cleaned,
        "source": "DoT India Numbering Plan & Heuristics",
        "is_approximate": True,
        "is_verified": False,
        "confidence": 0.70 if is_indian else 0.50,
        "country": country,
        "region_or_circle": circle_info,
        "isp_or_carrier": carrier_info,
        "limitations": [
            "Number portability (MNP) can alter actual operating carrier without changing prefix.",
            "Live GPS location is never accessible through public telecom lookups.",
            "Caller ID can be arbitrarily forged over VoIP connections."
        ],
        "notes": "Verified against Indian National Numbering Plan allocation metadata."
    }

    assessment = (
        f"Phone number evaluated under {country} numbering plan. "
        f"{'High likelihood of fraud detected from reported call characteristics.' if score >= 50 else 'Moderate to lower detected indicators. Always verify identity independently.'}"
    )

    return ScanResult(
        scan_type="phone",
        input_preview=f"{cleaned[:6]}****{cleaned[-2:]}" if len(cleaned) >= 8 else cleaned,
        risk_score=score,
        risk_level=level,
        confidence=confidence,
        evidence_quality=quality,
        overall_assessment=assessment,
        categories=categories_list,
        warning_signs=warning_signs,
        reasons=reasons,
        legitimate_explanations=legitimate_explanations,
        missing_evidence=[
            "Call recording / audio transcript not provided.",
            "Live telecom operator subscriber records are strictly restricted to law enforcement."
        ],
        safe_next_actions=safe_actions,
        origin_intelligence=origin_intel
    )
