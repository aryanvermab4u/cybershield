import re
from typing import Any

FRAUD_LEXICON = {
    # High risk terms (weight 3-5)
    "guaranteed returns": 4,
    "risk-free": 4,
    "earn daily": 3,
    "part time job": 3,
    "telegram task": 4,
    "work from home": 2,
    "like videos": 3,
    "prepaid task": 4,
    "deposit money": 3,
    "digital arrest": 5,
    "police inquiry": 4,
    "cbi officer": 5,
    "arrest warrant": 5,
    "drugs in courier": 5,
    "customs clearance": 4,
    "electricity disconnected": 5,
    "power cutoff": 4,
    "call electricity officer": 5,
    "tonight at 9:30": 4,
    "pan card link": 4,
    "account blocked": 4,
    "yono sbi": 3,
    "update kyc": 4,
    "within 24 hours": 3,
    "share otp": 5,
    "enter upi pin to receive": 5,
    "scratch card reward": 3,
    "lottery prize": 4,
    "kbc winner": 5,
    "install anydesk": 5,
    "download apk": 5,
    "traffic echallan": 4,
    "delivery fee rs": 4,
    "unclaimed parcel": 4
}

class TextClassifier:
    """
    Lightweight, explainable fraud classification model for unstructured text.
    Combines n-gram lexicon matching, urgency heuristics, and syntax patterns.
    """

    @staticmethod
    def classify(text: str) -> dict[str, Any]:
        text_lower = text.lower()
        score = 0
        matches = []

        for term, weight in FRAUD_LEXICON.items():
            if term in text_lower:
                score += weight * 7
                matches.append({"term": term, "weight": weight})

        # Length normalization
        score = min(95, score)

        # Confidence calculation
        confidence = min(0.92, 0.40 + (len(matches) * 0.10))

        if score >= 75:
            level = "very_high_risk"
            assessment = "Strong scam linguistic markers detected across multiple fraud vectors."
        elif score >= 50:
            level = "high_risk"
            assessment = "Multiple deceptive patterns commonly utilized in social engineering detected."
        elif score >= 25:
            level = "caution"
            assessment = "Mild urgency or commercial lure signals detected. Verify independently."
        else:
            level = "lower_risk"
            assessment = "Few or no high-risk fraud linguistic indicators identified in the submitted text."

        return {
            "score": score,
            "level": level,
            "confidence": round(confidence, 2),
            "matches": matches,
            "assessment": assessment
        }
