import pytest
from backend.app.engine.risk_calculator import RiskEngine, RiskFactor
from backend.app.engine.url_analyzer import is_private_or_reserved_ip, validate_ssrf_safety
from backend.app.engine.phone_analyzer import analyze_phone_number
from backend.app.engine.email_analyzer import check_lookalike_domain, parse_email_headers, analyze_email
from backend.app.engine.payment_analyzer import analyze_payment
from backend.app.engine.message_analyzer import analyze_message
from backend.app.routers.reports import redact_sensitive_pii

def test_risk_calculator_thresholds():
    # 0 factors -> lower risk
    score, level, confidence, quality = RiskEngine.calculate_score([])
    assert score <= 24
    assert level == "lower_risk"

    # High weight factors -> very high risk
    factors = [
        RiskFactor("Digital Arrest", 50, "Police threat", "Law Enforcement"),
        RiskFactor("Skype Enquiry", 45, "Demands video call", "Law Enforcement")
    ]
    score, level, confidence, quality = RiskEngine.calculate_score(factors)
    assert score >= 75
    assert level == "very_high_risk"
    assert confidence > 0.5
    assert quality in ["high", "moderate"]

def test_ssrf_protection():
    # Private IPv4 addresses
    assert is_private_or_reserved_ip("127.0.0.1") is True
    assert is_private_or_reserved_ip("10.0.0.1") is True
    assert is_private_or_reserved_ip("192.168.1.1") is True
    assert is_private_or_reserved_ip("172.16.5.10") is True
    assert is_private_or_reserved_ip("169.254.169.254") is True  # Cloud metadata IP
    assert is_private_or_reserved_ip("::1") is True

    # Public IP
    assert is_private_or_reserved_ip("8.8.8.8") is False
    assert is_private_or_reserved_ip("1.1.1.1") is False

    # Hostname validation
    safe, _, err = validate_ssrf_safety("localhost")
    assert safe is False
    assert "SSRF Block" in (err or "")

    safe, _, err = validate_ssrf_safety("127.0.0.1")
    assert safe is False

def test_email_lookalike_and_headers():
    # Lookalike brand
    res = check_lookalike_domain("sbi-kyc-update.xyz")
    assert res is not None
    assert "SBI" in res[0]

    # Genuine domain should not be flagged as lookalike
    assert check_lookalike_domain("statebankofindia.com") is None
    assert check_lookalike_domain("sbi.co.in") is None

    # Header parsing
    raw_headers = """
Received: from mail.attacker.net (unknown [198.51.100.25])
    by mx.google.com with ESMTPS id 123
    for <victim@example.com>; Wed, 14 Oct 2026 12:00:00 -0700
Authentication-Results: mx.google.com;
    spf=fail (google.com: domain of alert@sbi.com does not designate 198.51.100.25 as permitted sender);
    dkim=fail;
    dmarc=fail (p=REJECT)
    """
    parsed = parse_email_headers(raw_headers)
    assert "FAIL" in parsed["spf"]
    assert "FAIL" in parsed["dmarc"]
    assert parsed["client_ip"] == "198.51.100.25"
    assert parsed["hops"] >= 1

def test_phone_telecom_circles_and_spoofing():
    # 9810 is Delhi Airtel
    res = analyze_phone_number("+919810123456", "caller claimed to be from Mumbai police regarding digital arrest")
    assert "Delhi" in res.origin_intelligence["region_or_circle"]
    assert res.risk_score >= 50
    assert any("Caller ID can be easily spoofed" in r for r in res.reasons)

def test_payment_pin_to_receive():
    # UPI PIN required to receive money trap
    res = analyze_payment(
        upi_id="rewards@okhdfcbank",
        payment_text="Please enter your 6 digit UPI PIN to claim Rs 2000 cashback"
    )
    assert res.risk_score >= 70
    assert any("PIN-to-Receive" in w for w in res.warning_signs)

def test_multilingual_message_detection():
    # Electricity disconnection Hinglish
    msg_hinglish = "Dear customer your electricity power will be disconnected tonight at 9.30 pm from electricity office call 9876543210"
    res1 = analyze_message(msg_hinglish)
    assert res1.risk_score >= 50
    assert "Electricity Bill Disconnection Scam" in res1.categories

    # Marathi task scam
    msg_marathi = "दररोज 3000 ते 5000 कमवा YouTube video like करा Telegram task"
    res2 = analyze_message(msg_marathi)
    assert res2.risk_score >= 40

def test_pii_redaction():
    text = "User phone is 9876543210, Aadhaar 1234 5678 9012, PAN ABCDE1234F"
    redacted = redact_sensitive_pii(text)
    assert "9876543210" not in redacted
    assert "1234 5678 9012" not in redacted
    assert "ABCDE1234F" not in redacted
    assert "XXXX-XXXX-9012" in redacted
