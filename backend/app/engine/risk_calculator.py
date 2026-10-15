from typing import Any
from backend.app.schemas import RiskLevel

class RiskFactor:
    def __init__(self, name: str, weight: int, description: str, category: str, evidence: str = ""):
        self.name = name
        self.weight = weight  # 5 to 50
        self.description = description
        self.category = category
        self.evidence = evidence

class RiskEngine:
    """
    Explainable Risk Engine
    Combines weighted signals, avoids double counting, evaluates evidence quality,
    and produces plain-language justifications, legitimate explanations, and safe next steps.
    """

    @staticmethod
    def calculate_score(factors: list[RiskFactor], base_score: int = 5) -> tuple[int, str, float, str]:
        """
        Returns:
            (risk_score [0-100], risk_level, confidence [0.0-1.0], evidence_quality)
        """
        if not factors:
            return 10, RiskLevel.LOWER_RISK, 0.65, "moderate"

        # Diminishing returns formula to avoid artificial 100% on a single non-verified factor
        raw_score = base_score
        seen_categories = set()

        for factor in factors:
            weight = factor.weight
            # Mild dampening if multiple factors belong to exact same category
            if factor.category in seen_categories:
                weight = int(weight * 0.75)
            seen_categories.add(factor.category)
            raw_score += weight

        final_score = max(0, min(100, raw_score))

        # Risk level categorization based on user thresholds:
        # 0–24: Lower detected risk
        # 25–49: Caution
        # 50–74: High risk
        # 75–100: Very high risk
        if final_score <= 24:
            level = RiskLevel.LOWER_RISK
        elif final_score <= 49:
            level = RiskLevel.CAUTION
        elif final_score <= 74:
            level = RiskLevel.HIGH_RISK
        else:
            level = RiskLevel.VERY_HIGH_RISK

        # Confidence calculation based on number and corroboration of factors
        confidence = min(0.95, 0.40 + (len(factors) * 0.12))
        
        # Evidence quality
        if len(factors) >= 3 and any(f.weight >= 30 for f in factors):
            evidence_quality = "high"
        elif len(factors) >= 1:
            evidence_quality = "moderate"
        else:
            evidence_quality = "low"

        return final_score, level, round(confidence, 2), evidence_quality

    @staticmethod
    def build_safe_actions(risk_level: str, scan_type: str, categories: list[str]) -> list[str]:
        actions = []
        
        if risk_level in [RiskLevel.HIGH_RISK, RiskLevel.VERY_HIGH_RISK]:
            actions.append("Do NOT click links, download attachments, or call any phone number listed in this message.")
            actions.append("Never share OTPs, UPI PINs, passwords, or debit/credit card CVV codes with anyone.")
            
            if "Digital Arrest" in categories:
                actions.append("Recognize Digital Arrest scam: Indian police, CBI, ED, and courts NEVER conduct trials or make arrests over video calls (Skype, WhatsApp). Hang up immediately.")
            
            if "Payment / UPI" in categories or scan_type == "payment":
                actions.append("Remember: Entering your UPI PIN always DEDUCTS money from your bank account; a PIN is never needed to receive money.")
                actions.append("If you suspect fraudulent money transfer, immediately call India's Cybercrime Helpline 1930 or file a report at https://cybercrime.gov.in/ within the golden hour.")
                
            if "Electricity Bill" in categories:
                actions.append("Do not call private numbers for electricity bill issues. Verify your meter balance exclusively through the official state discom mobile app or website.")
                
            if "Work from Home / Task" in categories:
                actions.append("Legitimate companies never require candidates to make prepaid deposits or complete paid Telegram tasks to unlock earnings.")
                
            if "Fake Bank / KYC" in categories or scan_type == "email":
                actions.append("Contact your bank directly using the toll-free number printed on the back of your official debit/credit card.")

        elif risk_level == RiskLevel.CAUTION:
            actions.append("Exercise caution. Verify the sender's identity through independent, known-good contact channels.")
            actions.append("Inspect the exact spelling of domain names, sender email addresses, and UPI handles before proceeding.")
            actions.append("Do not provide personal details, Aadhaar, PAN, or banking credentials under artificial time pressure.")
        else:
            actions.append("Low risk detected based on available heuristics, but vigilance is still advised.")
            actions.append("Never assume any unsolicited communication is 100% genuine without independent verification.")
            actions.append("If unexpected instructions are given, verify directly with the organization via their official portal.")

        return actions

    @staticmethod
    def build_legitimate_explanations(scan_type: str, factors: list[RiskFactor]) -> list[str]:
        explanations = []
        if scan_type in ["url", "message"]:
            explanations.append("Some legitimate commercial platforms and delivery couriers use link shorteners (e.g., bit.ly) to fit SMS character limits.")
        if scan_type == "email":
            explanations.append("Third-party newsletters or automated billing software may trigger display name or SPF alignment warnings without being malicious.")
        if scan_type == "phone":
            explanations.append("Legitimate collection agencies or outbound telemarketing callers may share call patterns with reported nuisance numbers.")
        if not explanations:
            explanations.append("Automated urgent notifications from legitimate service providers can occasionally resemble social engineering patterns.")
        return explanations
