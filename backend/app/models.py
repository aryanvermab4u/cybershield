from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, DateTime, Text
from backend.app.database import Base

def utc_now():
    return datetime.now(timezone.utc)

class ScanRecord(Base):
    __tablename__ = "scan_records"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    scan_type = Column(String(32), index=True, nullable=False)
    input_preview = Column(String(256), nullable=False)
    risk_score = Column(Integer, nullable=False)  # 0 to 100
    risk_level = Column(String(32), nullable=False)  # lower_risk, caution, high_risk, very_high_risk
    confidence = Column(Float, default=0.5)  # 0.0 to 1.0
    evidence_quality = Column(String(32), default="moderate")  # low, moderate, high, verified
    summary = Column(Text, nullable=False)
    categories = Column(Text, default="[]")  # JSON list
    warning_signs = Column(Text, default="[]")  # JSON list
    reasons = Column(Text, default="[]")  # JSON list
    legitimate_explanations = Column(Text, default="[]")  # JSON list
    missing_evidence = Column(Text, default="[]")  # JSON list
    safe_actions = Column(Text, default="[]")  # JSON list
    origin_intelligence = Column(Text, default="{}")  # JSON dict
    created_at = Column(DateTime, default=utc_now)

class CommunityReport(Base):
    __tablename__ = "community_reports"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    identifier = Column(String(256), index=True, nullable=False)
    scam_type = Column(String(64), index=True, nullable=False)
    incident_date = Column(String(32), nullable=False)
    location_state = Column(String(64), nullable=False)
    location_district = Column(String(64), nullable=False)
    description = Column(Text, nullable=False)
    loss_amount = Column(Float, nullable=True)
    evidence_notes = Column(Text, nullable=True)
    status = Column(String(32), default="pending", index=True)  # pending, reviewed, rejected, verified
    confidence_score = Column(Float, default=0.5)
    moderation_notes = Column(Text, default="")
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

class HotspotArea(Base):
    __tablename__ = "hotspot_areas"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    state = Column(String(64), index=True, nullable=False)
    district = Column(String(64), index=True, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    report_count = Column(Integer, default=0)
    verified_count = Column(Integer, default=0)
    dominant_categories = Column(Text, default="[]")  # JSON list
    risk_index = Column(Integer, default=50)  # 0 to 100
    trend = Column(String(32), default="stable")  # increasing, stable, decreasing
    evidence_status = Column(String(32), default="Corroborated Reports")
    updated_at = Column(DateTime, default=utc_now)
