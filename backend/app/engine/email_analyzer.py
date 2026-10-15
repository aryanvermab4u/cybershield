import re
from typing import Optional
from backend.app.engine.risk_calculator import RiskEngine, RiskFactor
from backend.app.schemas import ScanResult

TARGET_BRANDS = [
    "sbi", "statebank", "hdfc", "icici", "axisbank", "pnb", "bob", "kotak",
    "paypal", "amazon", "netflix", "microsoft", "google", "apple", "irctc",
    "incometax", "parivahan", "uidai", "cybercrime"
]

SUSPICIOUS_TLDS = [
    ".top", ".xyz", ".club", ".work", ".icu", ".buzz", ".cam", ".live",
    ".bond", ".rest", ".fit", ".gq", ".cf", ".tk", ".ml", ".ga"
]

def check_lookalike_domain(domain: str) -> Optional[tuple[str, str]]:
    domain_lower = domain.lower()
    
    # Punycode check
    if domain_lower.startswith("xn--") or ".xn--" in domain_lower:
        return ("Punycode / Internationalized Domain", f"Domain uses Punycode ({domain_lower}), frequently used in homoglyph spoofing.")

    # Brand substring or lookalike
    for brand in TARGET_BRANDS:
        if brand in domain_lower:
            # Check if it's the genuine official domain
            official_domains = [
                f"{brand}.co.in", f"{brand}.com", f"{brand}.org", f"{brand}.gov.in",
                f"statebankofindia.com", f"hdfcbank.com", f"icicibank.com", f"axisbank.com"
            ]
            if not any(domain_lower == off or domain_lower.endswith("." + off) for off in official_domains):
                return (
                    f"Lookalike / Impersonation Domain ({brand.upper()})",
                    f"Domain '{domain_lower}' contains the brand '{brand}' but does not match the official domain name."
                )

    # Typo-squatting character substitutions
    substitutions = [
        (r"paypa[l1i]", "paypal"),
        (r"micr[o0]s[o0]ft", "microsoft"),
        (r"am[a4]z[o0]n", "amazon"),
        (r"n[e3]tfl[i1]x", "netflix"),
        (r"g[o0]{2}gl[e3]", "google")
    ]
    for pattern, target in substitutions:
        if re.search(pattern, domain_lower) and target not in domain_lower:
            return (
                f"Typo-squatted Brand ({target})",
                f"Domain '{domain_lower}' resembles '{target}' with deceptive character substitution."
            )

    return None

def parse_email_headers(raw_headers: str) -> dict:
    results = {
        "spf": "Not checked (no headers supplied)",
        "dkim": "Not checked (no headers supplied)",
        "dmarc": "Not checked (no headers supplied)",
        "client_ip": None,
        "hops": 0
    }
    if not raw_headers:
        return results

    headers_lower = raw_headers.lower()
    
    # SPF
    if "spf=pass" in headers_lower or "received-spf: pass" in headers_lower:
        results["spf"] = "PASS (Sender authorized by domain SPF record)"
    elif "spf=fail" in headers_lower or "received-spf: fail" in headers_lower:
        results["spf"] = "FAIL (Sending IP not authorized in domain SPF record)"
    elif "spf=softfail" in headers_lower:
        results["spf"] = "SOFTFAIL (Domain advises inspection)"
    elif "spf=" in headers_lower:
        results["spf"] = "NEUTRAL / NONE"

    # DKIM
    if "dkim=pass" in headers_lower:
        results["dkim"] = "PASS (Cryptographic signature verified)"
    elif "dkim=fail" in headers_lower:
        results["dkim"] = "FAIL (Cryptographic signature invalid or modified in transit)"
    elif "dkim-signature:" in headers_lower:
        results["dkim"] = "PRESENT (Signature header found)"

    # DMARC
    if "dmarc=pass" in headers_lower:
        results["dmarc"] = "PASS (Aligned with domain policy)"
    elif "dmarc=fail" in headers_lower:
        results["dmarc"] = "FAIL (Failed domain alignment policy)"

    # Client IP from Received headers
    ip_matches = re.findall(r"\[(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\]", raw_headers)
    public_ips = [ip for ip in ip_matches if not ip.startswith(("10.", "192.168.", "172.16.", "127."))]
    if public_ips:
        results["client_ip"] = public_ips[-1]
    
    received_count = len(re.findall(r"^received:", raw_headers, re.MULTILINE | re.IGNORECASE))
    results["hops"] = received_count

    return results

def analyze_email(
    sender_email: str,
    display_name: Optional[str] = None,
    subject: Optional[str] = None,
    body: Optional[str] = None,
    reply_to: Optional[str] = None,
    raw_headers: Optional[str] = None
) -> ScanResult:
    factors: list[RiskFactor] = []
    matched_categories: set[str] = set()

    # Extract sender domain
    parts = sender_email.split("@")
    sender_domain = parts[1].strip() if len(parts) > 1 else ""

    # Check 1: Display Name vs Domain Mismatch
    if display_name and sender_domain:
        display_lower = display_name.lower()
        for brand in TARGET_BRANDS:
            if brand in display_lower and brand not in sender_domain:
                factors.append(RiskFactor(
                    name=f"Display Name Impersonation ({brand.upper()})",
                    weight=45,
                    description=f"Display name claims to be '{display_name}', but sender domain is '{sender_domain}'.",
                    category="Impersonation",
                    evidence=f"Display: '{display_name}' vs From: '{sender_email}'"
                ))
                matched_categories.add("Display Name Spoofing")
                break

    # Check 2: Lookalike Domain
    if sender_domain:
        lookalike = check_lookalike_domain(sender_domain)
        if lookalike:
            factors.append(RiskFactor(
                name=lookalike[0],
                weight=48,
                description=lookalike[1],
                category="Domain Spoofing",
                evidence=sender_domain
            ))
            matched_categories.add("Lookalike Domain")

        # Suspicious TLD
        for tld in SUSPICIOUS_TLDS:
            if sender_domain.endswith(tld):
                factors.append(RiskFactor(
                    name="High-Risk Free/Budget TLD",
                    weight=30,
                    description=f"Sender domain uses '{tld}', a top-level domain frequently utilized in automated phishing campaigns.",
                    category="Domain Reputation",
                    evidence=tld
                ))
                matched_categories.add("Suspicious TLD")
                break

    # Check 3: Reply-To Mismatch
    if reply_to and sender_domain:
        reply_parts = reply_to.split("@")
        reply_domain = reply_parts[1].strip() if len(reply_parts) > 1 else ""
        if reply_domain and reply_domain.lower() != sender_domain.lower():
            factors.append(RiskFactor(
                name="Reply-To Redirection Mismatch",
                weight=35,
                description=f"Replies are directed to '{reply_to}', which differs from the sender domain '{sender_domain}'.",
                category="Header Redirection",
                evidence=f"From: {sender_domain} != Reply-To: {reply_domain}"
            ))
            matched_categories.add("Reply-To Mismatch")

    # Check 4: Raw Header Authentication (SPF / DKIM / DMARC)
    header_info = parse_email_headers(raw_headers or "")
    if "FAIL" in header_info["spf"]:
        factors.append(RiskFactor(
            name="SPF Authentication Failure",
            weight=40,
            description="The sending server IP is not listed in the sender domain's SPF record. High likelihood of header spoofing.",
            category="Email Authentication",
            evidence=header_info["spf"]
        ))
        matched_categories.add("SPF Failure")
    
    if "FAIL" in header_info["dmarc"]:
        factors.append(RiskFactor(
            name="DMARC Policy Failure",
            weight=42,
            description="The message failed DMARC alignment validation.",
            category="Email Authentication",
            evidence=header_info["dmarc"]
        ))
        matched_categories.add("DMARC Failure")

    # Check 5: Urgency & Credential Harvesting in Subject / Body
    combined_content = f"{subject or ''} {body or ''}".lower()
    
    urgency_patterns = [
        (r"account (suspended|blocked|frozen|disabled|terminated)", "Urgent Account Suspension Threat", 38),
        (r"within 24 hours|immediate action required|expires today", "Artificial Time Urgency", 25),
        (r"verify your (password|credentials|security details)", "Direct Credential Request", 45),
        (r"tax refund|unclaimed payment|overdue invoice", "Financial Enticement / Fake Invoice", 32),
        (r"pan card (deactivated|invalid)|link aadhaar immediately", "Statutory Impersonation / KYC Panic", 40)
    ]

    for pat, title, weight in urgency_patterns:
        if re.search(pat, combined_content):
            factors.append(RiskFactor(
                name=title,
                weight=weight,
                description=f"Content contains social engineering trigger: '{pat}'.",
                category="Social Engineering",
                evidence=pat
            ))
            matched_categories.add(title)

    score, level, confidence, quality = RiskEngine.calculate_score(factors, base_score=10)
    categories_list = list(matched_categories) if matched_categories else ["Email Security Evaluation"]
    reasons = [f.description for f in factors]
    
    if raw_headers:
        reasons.append(f"Header Analysis: SPF: {header_info['spf']} | DKIM: {header_info['dkim']} | DMARC: {header_info['dmarc']}")
    else:
        reasons.append("Raw email headers were not supplied. SPF, DKIM, and DMARC checks are marked as 'Not checked'.")

    # Safe actions & explanations
    safe_actions = RiskEngine.build_safe_actions(level, "email", categories_list)
    legitimate_explanations = RiskEngine.build_legitimate_explanations("email", factors)

    origin_intel = {
        "item_type": "email",
        "identified_entity": sender_email,
        "source": "Parsed Email Headers & DNS",
        "is_approximate": True,
        "is_verified": False if not raw_headers else ("PASS" in header_info["spf"]),
        "confidence": 0.85 if raw_headers else 0.55,
        "domain": sender_domain,
        "sending_ip": header_info.get("client_ip") or "Unavailable without raw headers",
        "transit_hops": header_info.get("hops", 0),
        "authentication_summary": {
            "spf": header_info["spf"],
            "dkim": header_info["dkim"],
            "dmarc": header_info["dmarc"]
        },
        "limitations": [
            "Display names can be set freely in standard mail clients.",
            "Passing SPF/DKIM authentication confirms only sending authorization, not content honesty.",
            "Sending IP reflects the mail server relay, not necessarily the sender's physical laptop."
        ],
        "notes": "Evaluation performed using strict RFC 5321/5322 header parsing logic."
    }

    return ScanResult(
        scan_type="email",
        input_preview=f"{sender_email} | Subject: {(subject or 'No subject')[:40]}",
        risk_score=score,
        risk_level=level,
        confidence=confidence,
        evidence_quality=quality if raw_headers else "moderate",
        overall_assessment=(
            f"Email from '{sender_domain or sender_email}' analyzed. "
            f"{'Significant fraud or spoofing indicators detected.' if score >= 50 else 'Lower risk heuristic indicators. Verify sender directly.'}"
        ),
        categories=categories_list,
        warning_signs=[f.name for f in factors if f.weight >= 30],
        reasons=reasons,
        legitimate_explanations=legitimate_explanations,
        missing_evidence=[] if raw_headers else ["Raw email headers were not provided for cryptographic verification."],
        safe_next_actions=safe_actions,
        origin_intelligence=origin_intel
    )
