import json
from datetime import datetime, timedelta, timezone
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.models import HotspotArea, CommunityReport, ScanRecord

HOTSPOTS_SEED = [
    {
        "state": "Jharkhand",
        "district": "Jamtara",
        "latitude": 23.9629,
        "longitude": 86.8016,
        "report_count": 142,
        "verified_count": 118,
        "dominant_categories": ["Bank KYC Phishing", "Fake Yono Support", "SIM Swap Deception"],
        "risk_index": 92,
        "trend": "stable",
        "evidence_status": "Law Enforcement Corroborated"
    },
    {
        "state": "Haryana",
        "district": "Nuh (Mewat)",
        "latitude": 28.1130,
        "longitude": 77.0068,
        "report_count": 185,
        "verified_count": 156,
        "dominant_categories": ["OLX Army Impersonation", "Sextortion / Video Call Traps", "Fake Vehicle Advance"],
        "risk_index": 95,
        "trend": "increasing",
        "evidence_status": "State Cyber Cell Tracked"
    },
    {
        "state": "Rajasthan",
        "district": "Bharatpur",
        "latitude": 27.2152,
        "longitude": 77.5030,
        "report_count": 98,
        "verified_count": 76,
        "dominant_categories": ["Fake Military Canteen Deals", "Loan Approval Fee Scams", "Aadhaar Card Traps"],
        "risk_index": 88,
        "trend": "stable",
        "evidence_status": "Corroborated Reports"
    },
    {
        "state": "Uttar Pradesh",
        "district": "Mathura",
        "latitude": 27.4924,
        "longitude": 77.6737,
        "report_count": 74,
        "verified_count": 58,
        "dominant_categories": ["Part-Time Telegram Task", "Fake Online Shopping Clearance", "Advance Fee"],
        "risk_index": 82,
        "trend": "decreasing",
        "evidence_status": "Moderated Reports"
    },
    {
        "state": "Delhi",
        "district": "Delhi NCR",
        "latitude": 28.6139,
        "longitude": 77.2090,
        "report_count": 230,
        "verified_count": 192,
        "dominant_categories": ["Digital Arrest CBI/Police", "Fake Stock Trading Groups", "Electricity Bill Disconnection"],
        "risk_index": 86,
        "trend": "increasing",
        "evidence_status": "High Volume Consumer Reports"
    },
    {
        "state": "Maharashtra",
        "district": "Mumbai Suburbs",
        "latitude": 19.0760,
        "longitude": 72.8777,
        "report_count": 210,
        "verified_count": 178,
        "dominant_categories": ["Share Trading Extortion", "Electricity Disconnection Panic", "Customs Courier Seizure"],
        "risk_index": 84,
        "trend": "increasing",
        "evidence_status": "High Volume Consumer Reports"
    },
    {
        "state": "Karnataka",
        "district": "Bengaluru Urban",
        "latitude": 12.9716,
        "longitude": 77.5946,
        "report_count": 165,
        "verified_count": 134,
        "dominant_categories": ["Prepaid Work-from-Home Tasks", "Fake Tech Support / AnyDesk", "FedEx Contraband Calls"],
        "risk_index": 78,
        "trend": "stable",
        "evidence_status": "Verified Intelligence"
    },
    {
        "state": "Telangana",
        "district": "Hyderabad",
        "latitude": 17.3850,
        "longitude": 78.4867,
        "report_count": 120,
        "verified_count": 94,
        "dominant_categories": ["Digital Arrest Threat", "Crypto Investment Advisory", "Fake Courier Customs Duty"],
        "risk_index": 75,
        "trend": "stable",
        "evidence_status": "Corroborated Reports"
    },
    {
        "state": "Gujarat",
        "district": "Ahmedabad",
        "latitude": 23.0225,
        "longitude": 72.5714,
        "report_count": 88,
        "verified_count": 68,
        "dominant_categories": ["UPI Collect Request Trap", "Fake Stock Advisory Groups", "Free Recharge Giveaways"],
        "risk_index": 70,
        "trend": "decreasing",
        "evidence_status": "Moderated Reports"
    },
    {
        "state": "West Bengal",
        "district": "Kolkata",
        "latitude": 22.5726,
        "longitude": 88.3639,
        "report_count": 95,
        "verified_count": 72,
        "dominant_categories": ["Google Search Fake Customer Care", "Illegal Instant Loan Harassment", "Electricity Bill"],
        "risk_index": 74,
        "trend": "stable",
        "evidence_status": "Corroborated Reports"
    }
]

COMMUNITY_REPORTS_SEED = [
    {
        "identifier": "+91 98****3210",
        "scam_type": "Electricity Bill Disconnection",
        "incident_date": "2026-10-12",
        "location_state": "Maharashtra",
        "location_district": "Pune",
        "description": "Received SMS at 8 PM stating power will be disconnected at 9:30 PM due to unpaid bill of Rs 120. When I called the number in SMS, caller insisted I download QuickSupport app to update bill.",
        "loss_amount": 0.0,
        "evidence_notes": "SMS originated from private 10-digit mobile, not Mahavitaran official header.",
        "status": "verified",
        "confidence_score": 0.95,
        "moderation_notes": "Verified against known electricity bill discom impersonation modus operandi."
    },
    {
        "identifier": "sbi-kyc-verify-portal.top",
        "scam_type": "Bank Phishing Portal",
        "incident_date": "2026-10-13",
        "location_state": "Delhi",
        "location_district": "New Delhi",
        "description": "WhatsApp message claimed my SBI Yono was blocked. The link led to a replica of SBI netbanking page requesting username, password, and profile password.",
        "loss_amount": 0.0,
        "evidence_notes": "Domain registered 3 days ago on .top registry. Lookalike SBI logos.",
        "status": "verified",
        "confidence_score": 0.98,
        "moderation_notes": "Phishing credential harvesting portal confirmed."
    },
    {
        "identifier": "cashback.rewards98@oksbi",
        "scam_type": "UPI Collect Request Fraud",
        "incident_date": "2026-10-11",
        "location_state": "Karnataka",
        "location_district": "Bengaluru",
        "description": "Person on OLX claimed they wanted to buy my sofa. Sent a collect request of Rs 4,500 claiming I had to approve and enter my PIN to receive the advance payment.",
        "loss_amount": 0.0,
        "evidence_notes": "VPA name disguised with 'rewards' keyword. Standard PIN-to-receive trap.",
        "status": "verified",
        "confidence_score": 0.92,
        "moderation_notes": "Collect request inverted payment fraud confirmed."
    },
    {
        "identifier": "+91 70****9912",
        "scam_type": "Digital Arrest / Police Extortion",
        "incident_date": "2026-10-14",
        "location_state": "Telangana",
        "location_district": "Hyderabad",
        "description": "Caller claimed to be DCP Crime Branch Mumbai. Said 140 grams MDMA was seized in a courier sent to Taiwan under my Aadhaar number. Demanded Skype video call for clearance certificate.",
        "loss_amount": 0.0,
        "evidence_notes": "Caller sent fake Supreme Court digital warrant on WhatsApp.",
        "status": "verified",
        "confidence_score": 0.96,
        "moderation_notes": "Classic digital arrest courier contraband extortion script."
    },
    {
        "identifier": "t.me/global_tasks_daily",
        "scam_type": "Part-Time Task Scam",
        "incident_date": "2026-10-10",
        "location_state": "Gujarat",
        "location_district": "Surat",
        "description": "Offered Rs 150 per YouTube like. Initial Rs 450 was credited to my UPI. Then asked to deposit Rs 5,000 in a merchant account to unlock high-value tasks.",
        "loss_amount": 5000.0,
        "evidence_notes": "Deposit requested to individual savings account in another state.",
        "status": "reviewed",
        "confidence_score": 0.85,
        "moderation_notes": "Prepaid task Ponzi model reviewed and corroborated."
    }
]

SCAN_RECORDS_SEED = [
    {
        "scan_type": "phone",
        "input_preview": "+91 9810****22",
        "risk_score": 85,
        "risk_level": "very_high_risk",
        "confidence": 0.88,
        "evidence_quality": "high",
        "summary": "Phone number evaluated under Delhi circle. High likelihood of fraud detected from reported call characteristics (Digital Arrest threat).",
        "categories": ["Digital Arrest / Law Enforcement Impersonation", "Phone Reputation Check"],
        "warning_signs": ["Impersonating law enforcement / Digital Arrest threat detected."],
        "reasons": [
            "Call description matched pattern: 'digital arrest'. Caller ID can be easily spoofed.",
            "Caller claims to be police officer threatening arrest over video call."
        ],
        "legitimate_explanations": ["Collection agencies occasionally share call pattern signatures."],
        "missing_evidence": ["Call recording not provided."],
        "safe_actions": [
            "Hang up immediately. Indian police and courts NEVER conduct arrests or trials over Skype/WhatsApp.",
            "Report immediately to National Cybercrime Portal 1930."
        ],
        "origin_intelligence": {
            "country": "India (+91)",
            "region_or_circle": "Delhi & NCR (Airtel)",
            "carrier": "Indian GSM/LTE Carrier",
            "is_approximate": True
        }
    },
    {
        "scan_type": "url",
        "input_preview": "http://sbi-netbanking-kyc-update.xyz/login.php",
        "risk_score": 92,
        "risk_level": "very_high_risk",
        "confidence": 0.94,
        "evidence_quality": "high",
        "summary": "URL evaluated with 1 redirect hop. Critical phishing and lookalike domain indicators detected targeting State Bank of India.",
        "categories": ["Brand Spoofing", "Suspicious TLD", "Credential Harvesting", "Insecure HTTP"],
        "warning_signs": ["Brand Spoofing Target (SBI)", "Suspicious Top-Level Domain (.xyz)", "Insecure HTTP Protocol"],
        "reasons": [
            "The domain contains brand keyword 'sbi' on an unauthorized root domain 'sbi-netbanking-kyc-update.xyz'.",
            "The URL terminates in '.xyz', a high-risk TLD frequently used in short-lived phishing campaigns.",
            "URL uses unencrypted plain HTTP instead of genuine HTTPS."
        ],
        "legitimate_explanations": ["None for this combination of indicators."],
        "missing_evidence": ["Third-party blacklist records."],
        "safe_actions": [
            "Do NOT enter credentials or passwords on this webpage.",
            "Access SBI exclusively via official domain: https://onlinesbi.sbi/"
        ],
        "origin_intelligence": {
            "entity": "sbi-netbanking-kyc-update.xyz",
            "source": "Safe DNS and SSRF Guard",
            "is_approximate": True
        }
    },
    {
        "scan_type": "payment",
        "input_preview": "refund-officer@okaxis",
        "risk_score": 78,
        "risk_level": "very_high_risk",
        "confidence": 0.82,
        "evidence_quality": "high",
        "summary": "Payment instructions evaluated. Critical fraud signals: UPI 'PIN-to-Receive' trap detected.",
        "categories": ["PIN-to-Receive Trap", "VPA Impersonation"],
        "warning_signs": ["Deadly UPI 'PIN-to-Receive' Trap", "Keyword Impersonation in UPI Handle ('refund')"],
        "reasons": [
            "Instructions falsely state you must enter your UPI PIN to claim cashback or refunds.",
            "In UPI, entering your PIN always DEDUCTS money from your bank account."
        ],
        "legitimate_explanations": ["Legitimate merchants occasionally use collect requests for purchases initiated by buyers."],
        "missing_evidence": ["NPCI bank account holder legal registered name."],
        "safe_actions": [
            "Decline all incoming UPI collect requests immediately.",
            "Never enter your UPI PIN unless you intend to pay out money."
        ],
        "origin_intelligence": {
            "vpa": "refund-officer@okaxis",
            "psp": "Google Pay (Axis Bank)",
            "is_approximate": True
        }
    }
]

async def seed_database(db: AsyncSession):
    # Check if hotspot areas exist
    hotspot_count = (await db.execute(select(func.count(HotspotArea.id)))).scalar() or 0
    if hotspot_count == 0:
        for item in HOTSPOTS_SEED:
            hotspot = HotspotArea(
                state=item["state"],
                district=item["district"],
                latitude=item["latitude"],
                longitude=item["longitude"],
                report_count=item["report_count"],
                verified_count=item["verified_count"],
                dominant_categories=json.dumps(item["dominant_categories"]),
                risk_index=item["risk_index"],
                trend=item["trend"],
                evidence_status=item["evidence_status"]
            )
            db.add(hotspot)

    # Check if community reports exist
    report_count = (await db.execute(select(func.count(CommunityReport.id)))).scalar() or 0
    if report_count == 0:
        now = datetime.now(timezone.utc)
        for i, item in enumerate(COMMUNITY_REPORTS_SEED):
            rep = CommunityReport(
                identifier=item["identifier"],
                scam_type=item["scam_type"],
                incident_date=item["incident_date"],
                location_state=item["location_state"],
                location_district=item["location_district"],
                description=item["description"],
                loss_amount=item["loss_amount"],
                evidence_notes=item["evidence_notes"],
                status=item["status"],
                confidence_score=item["confidence_score"],
                moderation_notes=item["moderation_notes"],
                created_at=now - timedelta(days=i * 2, hours=3)
            )
            db.add(rep)

    # Check if scan records exist
    scan_count = (await db.execute(select(func.count(ScanRecord.id)))).scalar() or 0
    if scan_count == 0:
        now = datetime.now(timezone.utc)
        for i, item in enumerate(SCAN_RECORDS_SEED):
            rec = ScanRecord(
                scan_type=item["scan_type"],
                input_preview=item["input_preview"],
                risk_score=item["risk_score"],
                risk_level=item["risk_level"],
                confidence=item["confidence"],
                evidence_quality=item["evidence_quality"],
                summary=item["summary"],
                categories=json.dumps(item["categories"]),
                warning_signs=json.dumps(item["warning_signs"]),
                reasons=json.dumps(item["reasons"]),
                legitimate_explanations=json.dumps(item["legitimate_explanations"]),
                missing_evidence=json.dumps(item["missing_evidence"]),
                safe_actions=json.dumps(item["safe_actions"]),
                origin_intelligence=json.dumps(item["origin_intelligence"]),
                created_at=now - timedelta(days=i, hours=2)
            )
            db.add(rec)

    await db.commit()
