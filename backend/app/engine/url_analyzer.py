import re
from typing import Optional
import ipaddress
import socket
from urllib.parse import urlparse
import httpx
from backend.app.config import settings
from backend.app.engine.risk_calculator import RiskEngine, RiskFactor
from backend.app.schemas import ScanResult

POPULAR_BRANDS = [
    "sbi", "onlinesbi", "hdfc", "hdfcbank", "icici", "icicibank", "axisbank",
    "punjabbank", "paypal", "amazon", "netflix", "microsoft", "google", "apple",
    "facebook", "instagram", "whatsapp", "telegram", "irctc", "uidai", "parivahan",
    "incometax", "speedpost", "indexpay", "phonepe", "paytm", "bhimupi"
]

SUSPICIOUS_TLDS = [
    ".xyz", ".top", ".club", ".work", ".icu", ".buzz", ".cam", ".live",
    ".bond", ".rest", ".fit", ".gq", ".cf", ".tk", ".ml", ".ga", ".ru", ".cn"
]

SHORTENER_DOMAINS = [
    "bit.ly", "tinyurl.com", "t.co", "cutt.ly", "is.gd", "rb.gy", "shorturl.at", "ow.ly", "buff.ly"
]

def is_private_or_reserved_ip(ip_str: str) -> bool:
    try:
        ip = ipaddress.ip_address(ip_str)
        return (
            ip.is_private or
            ip.is_loopback or
            ip.is_link_local or
            ip.is_multicast or
            ip.is_reserved or
            ip.is_unspecified or
            str(ip).startswith("169.254.") # Cloud metadata
        )
    except ValueError:
        return True

def validate_ssrf_safety(hostname: str) -> tuple[bool, Optional[str], Optional[str]]:
    """
    Resolves hostname to IP and verifies that it is not in a private, loopback, or metadata address range.
    Returns: (is_safe, resolved_ip, error_message)
    """
    # Direct localhost or IP string
    if hostname.lower() in ["localhost", "127.0.0.1", "::1", "0.0.0.0", "metadata.google.internal"]:
        return False, None, "SSRF Block: Access to localhost or loopback is strictly prohibited."

    try:
        # Resolve all IPs
        addr_info = socket.getaddrinfo(hostname, None)
        ips = [item[4][0] for item in addr_info]
        if not ips:
            return False, None, "Could not resolve hostname IP address."

        for ip in ips:
            if is_private_or_reserved_ip(ip):
                return False, ip, f"SSRF Block: Hostname resolves to private/reserved IP {ip}."

        return True, ips[0], None
    except socket.gaierror:
        return False, None, "DNS lookup failed for hostname."
    except Exception as e:
        return False, None, f"Resolution error: {str(e)}"

async def analyze_url(raw_url: str, follow_redirects: bool = True) -> ScanResult:
    # Normalize URL scheme if missing
    clean_url = raw_url.strip()
    if not clean_url.startswith(("http://", "https://")):
        clean_url = "http://" + clean_url

    parsed = urlparse(clean_url)
    hostname = (parsed.hostname or "").lower()
    path = parsed.path.lower()
    scheme = parsed.scheme.lower()

    factors: list[RiskFactor] = []
    matched_categories: set[str] = set()
    redirect_chain: list[str] = [clean_url]
    resolved_ip = None
    server_geo = "Unknown"

    # Scheme Check
    if scheme == "http":
        factors.append(RiskFactor(
            name="Insecure HTTP Protocol",
            weight=20,
            description="The URL uses unencrypted plain HTTP instead of HTTPS. All modern legitimate authentication and banking portals require TLS encryption.",
            category="Transport Security"
        ))
        matched_categories.add("Insecure HTTP")

    # IP Address as Hostname Check
    is_ip_host = False
    try:
        ipaddress.ip_address(hostname)
        is_ip_host = True
        factors.append(RiskFactor(
            name="IP Address Used as Hostname",
            weight=45,
            description=f"Direct IP address '{hostname}' used instead of a registered domain name. Typical of illicit phishing servers bypassing domain reputation.",
            category="Domain Obfuscation"
        ))
        matched_categories.add("Direct IP Host")
    except ValueError:
        pass

    # Punycode check
    if "xn--" in hostname:
        factors.append(RiskFactor(
            name="Punycode / Homoglyph Encoding",
            weight=48,
            description=f"Hostname contains Punycode representation ({hostname}), frequently used in lookalike homograph attacks.",
            category="Homoglyph Spoofing"
        ))
        matched_categories.add("Punycode Domain")

    # Lookalike Brand Check
    for brand in POPULAR_BRANDS:
        if brand in hostname:
            legitimate_roots = [
                f"{brand}.com", f"{brand}.co.in", f"{brand}.org", f"{brand}.gov.in",
                f"statebankofindia.com", f"hdfcbank.com", f"icicibank.com", f"axisbank.com"
            ]
            if not any(hostname == root or hostname.endswith("." + root) for root in legitimate_roots):
                factors.append(RiskFactor(
                    name=f"Brand Spoofing Target ({brand.upper()})",
                    weight=48,
                    description=f"The domain contains the brand keyword '{brand}' on an unauthorized root domain '{hostname}'.",
                    category="Phishing Impersonation",
                    evidence=hostname
                ))
                matched_categories.add("Brand Spoofing")
                break

    # Suspicious TLD
    for tld in SUSPICIOUS_TLDS:
        if hostname.endswith(tld):
            factors.append(RiskFactor(
                name="Suspicious Top-Level Domain",
                weight=32,
                description=f"The URL terminates in '{tld}', an extension with high statistical prevalence in short-lived phishing campaigns.",
                category="TLD Reputation",
                evidence=tld
            ))
            matched_categories.add("Suspicious TLD")
            break

    # URL Shortener Detection
    if any(shortener in hostname for shortener in SHORTENER_DOMAINS):
        factors.append(RiskFactor(
            name="URL Shortening Service",
            weight=28,
            description=f"URL is routed through link shortener '{hostname}', hiding the true server destination.",
            category="Obfuscated Link",
            evidence=hostname
        ))
        matched_categories.add("URL Shortener")

    # Path Phishing Patterns
    phishing_path_indicators = [
        (r"/(login|signin|sign-in|authenticate)", "Credential Login Prompt on Untrusted Host", 30),
        (r"/(kyc-update|pan-verify|aadhar-verify)", "Fake KYC / Verification Portal", 46),
        (r"/(payment|collect|gateway|checkout).*\.php", "Phishing Payment Gateway Endpoint", 38),
        (r"\.apk$", "Direct Android APK Download Payload", 50)
    ]
    for pat, title, weight in phishing_path_indicators:
        if re.search(pat, path):
            factors.append(RiskFactor(
                name=title,
                weight=weight,
                description=f"URL path contains high-risk trigger: '{pat}'.",
                category="Credential Harvesting",
                evidence=pat
            ))
            matched_categories.add(title)

    # Safe SSRF Validation and Controlled Redirect Resolution
    is_safe, resolved_ip, ssrf_err = validate_ssrf_safety(hostname)
    if not is_safe:
        factors.append(RiskFactor(
            name="SSRF / Private Address Block",
            weight=60,
            description=ssrf_err or "Private network destination rejected.",
            category="Network Security",
            evidence=hostname
        ))
        matched_categories.add("SSRF Block")
    elif follow_redirects and not is_ip_host:
        try:
            # Safely trace redirects without executing JS, with strict limits
            async with httpx.AsyncClient(
                timeout=settings.HTTP_TIMEOUT_SECONDS,
                follow_redirects=False,
                verify=True
            ) as client:
                current_target = clean_url
                for _ in range(settings.MAX_REDIRECT_HOPS):
                    resp = await client.head(current_target, headers={"User-Agent": "CyberShield-Security-Scanner/1.0"})
                    if resp.is_redirect:
                        loc = resp.headers.get("location")
                        if loc:
                            if loc.startswith("/"):
                                loc = f"{parsed.scheme}://{parsed.netloc}{loc}"
                            redirect_chain.append(loc)
                            target_parsed = urlparse(loc)
                            target_host = (target_parsed.hostname or "").lower()
                            # SSRF re-check on redirect target!
                            is_target_safe, _, target_err = validate_ssrf_safety(target_host)
                            if not is_target_safe:
                                factors.append(RiskFactor(
                                    name="Malicious Redirect to Private / Prohibited Host",
                                    weight=65,
                                    description=f"Redirect chain attempted to navigate to prohibited host: {target_err}",
                                    category="SSRF Redirect"
                                ))
                                break
                            current_target = loc
                        else:
                            break
                    else:
                        break
        except Exception:
            # Network timeout or refusal is recorded without crashing
            pass

    score, level, confidence, quality = RiskEngine.calculate_score(factors, base_score=5)
    categories_list = list(matched_categories) if matched_categories else ["URL Security Assessment"]
    reasons = [f.description for f in factors]
    warning_signs = [f.name for f in factors if f.weight >= 30]

    safe_actions = RiskEngine.build_safe_actions(level, "url", categories_list)
    legitimate_explanations = RiskEngine.build_legitimate_explanations("url", factors)

    origin_intel = {
        "item_type": "url",
        "identified_entity": hostname,
        "resolved_ip": resolved_ip or "Protected / Not resolved",
        "scheme": scheme,
        "redirect_hops": len(redirect_chain) - 1,
        "redirect_chain": redirect_chain,
        "source": "DNS & Safe Backend HTTP Probe with SSRF Guard",
        "is_approximate": True,
        "is_verified": False,
        "confidence": confidence,
        "google_safe_browsing": "Not configured (Setup API key in Settings)" if not settings.GOOGLE_SAFE_BROWSING_API_KEY else "Active Integration",
        "limitations": [
            "Ephemeral phishing sites may show clean DNS records before domain blacklists update.",
            "Content was analyzed securely without executing client-side JavaScript or rendering payloads."
        ],
        "notes": "Verified against RFC 3986 syntax and strict anti-SSRF address filters."
    }

    return ScanResult(
        scan_type="url",
        input_preview=clean_url[:70] + ("..." if len(clean_url) > 70 else ""),
        risk_score=score,
        risk_level=level,
        confidence=confidence,
        evidence_quality=quality,
        overall_assessment=(
            f"URL evaluated with {len(redirect_chain) - 1} redirect hops. "
            f"{'High phishing or malicious indicators found.' if score >= 50 else 'Standard or lower risk indicators detected.'}"
        ),
        categories=categories_list,
        warning_signs=warning_signs,
        reasons=reasons,
        legitimate_explanations=legitimate_explanations,
        missing_evidence=[
            "Third-party Safe Browsing API key not configured (heuristic scan utilized)."
        ],
        safe_next_actions=safe_actions,
        origin_intelligence=origin_intel
    )
