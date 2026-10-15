from datetime import datetime, timezone
from typing import Optional, Any
from pydantic import BaseModel, Field

def utc_now():
    return datetime.now(timezone.utc)

# Base & Enums
class RiskLevel:
    LOWER_RISK = "lower_risk"
    CAUTION = "caution"
    HIGH_RISK = "high_risk"
    VERY_HIGH_RISK = "very_high_risk"
    INSUFFICIENT_EVIDENCE = "insufficient_evidence"

class OriginIntelligenceOut(BaseModel):
    item_type: str = "unknown"
    identified_entity: str = ""
    source: str = "Local Heuristics & Telecom Registry"
    is_approximate: bool = True
    is_verified: bool = False
    confidence: float = 0.5
    country: Optional[str] = None
    region_or_circle: Optional[str] = None
    isp_or_carrier: Optional[str] = None
    hosting_provider: Optional[str] = None
    ip_address: Optional[str] = None
    sender_header: Optional[str] = None
    limitations: list[str] = []
    notes: Optional[str] = None
    lookup_time: datetime = Field(default_factory=utc_now)

class ScanResult(BaseModel):
    id: Optional[int] = None
    scan_type: str
    input_preview: str
    risk_score: int = Field(..., ge=0, le=100)
    risk_level: str
    confidence: float = Field(..., ge=0.0, le=1.0)
    evidence_quality: str
    overall_assessment: str
    categories: list[str] = []
    warning_signs: list[str] = []
    reasons: list[str] = []
    legitimate_explanations: list[str] = []
    missing_evidence: list[str] = []
    safe_next_actions: list[str] = []
    origin_intelligence: Optional[dict[str, Any]] = None
    created_at: datetime = Field(default_factory=utc_now)
    disclaimer: str = (
        "Scores are risk assessments based on available heuristic and reputational signals, "
        "not absolute guarantees of safety or criminality. CyberShield never automatically opens "
        "links or executes attachments."
    )

# Input Schemas
class UniversalScanRequest(BaseModel):
    content: str = Field(..., min_length=1, max_length=50000, description="Input string to analyze")
    scan_hint: Optional[str] = Field("auto", description="auto, phone, email, message, url, payment, qr, offer")
    context_description: Optional[str] = None
    save_history: bool = True

class PhoneScanRequest(BaseModel):
    phone_number: str = Field(..., min_length=4, max_length=32)
    call_description: Optional[str] = None
    save_history: bool = True

class EmailScanRequest(BaseModel):
    sender_email: str = Field(..., min_length=3, max_length=320)
    display_name: Optional[str] = None
    subject: Optional[str] = None
    body: Optional[str] = None
    reply_to: Optional[str] = None
    raw_headers: Optional[str] = None
    save_history: bool = True

class MessageScanRequest(BaseModel):
    message_text: str = Field(..., min_length=2, max_length=10000)
    platform: str = Field("sms", description="sms, whatsapp, telegram, instagram, other")
    sender_id: Optional[str] = None
    save_history: bool = True

class UrlScanRequest(BaseModel):
    url: str = Field(..., min_length=3, max_length=2048)
    follow_redirects: bool = True
    save_history: bool = True

class PaymentScanRequest(BaseModel):
    upi_id: Optional[str] = None
    payment_text: Optional[str] = None
    amount: Optional[float] = None
    save_history: bool = True

class QrScanRequest(BaseModel):
    decoded_content: str = Field(..., min_length=1, max_length=2048)
    save_history: bool = True

class AttachmentScanRequest(BaseModel):
    filename: str = Field(..., min_length=1, max_length=256)
    filesize_bytes: Optional[int] = None
    mime_type: Optional[str] = None
    hash_sha256: Optional[str] = None
    save_history: bool = True

# Community Reports Schemas
class CommunityReportCreate(BaseModel):
    identifier: str = Field(..., min_length=3, max_length=256)
    scam_type: str = Field(..., min_length=2, max_length=64)
    incident_date: str = Field(..., min_length=4, max_length=32)
    location_state: str = Field(..., min_length=2, max_length=64)
    location_district: str = Field(..., min_length=2, max_length=64)
    description: str = Field(..., min_length=10, max_length=4000)
    loss_amount: Optional[float] = Field(None, ge=0)
    evidence_notes: Optional[str] = None

class CommunityReportStatusUpdate(BaseModel):
    status: str = Field(..., pattern="^(pending|reviewed|rejected|verified)$")
    moderation_notes: Optional[str] = None

class CommunityReportOut(BaseModel):
    id: int
    identifier: str
    scam_type: str
    incident_date: str
    location_state: str
    location_district: str
    description: str
    loss_amount: Optional[float] = None
    evidence_notes: Optional[str] = None
    status: str
    confidence_score: float
    moderation_notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

# Hotspot Schemas
class HotspotOut(BaseModel):
    id: int
    state: str
    district: str
    latitude: float
    longitude: float
    report_count: int
    verified_count: int
    dominant_categories: list[str]
    risk_index: int
    trend: str
    evidence_status: str
    updated_at: datetime

# Stats Schemas
class OverviewStats(BaseModel):
    total_scans: int
    high_risk_scans: int
    caution_scans: int
    lower_risk_scans: int
    verified_reports_count: int
    pending_reports_count: int
    risk_distribution: list[dict[str, Any]]
    category_distribution: list[dict[str, Any]]
    timeline_data: list[dict[str, Any]]
    recent_scans: list[ScanResult]
    recent_reports: list[CommunityReportOut]
