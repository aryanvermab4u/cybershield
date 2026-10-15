import re
from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.database import get_db
from backend.app.models import CommunityReport
from backend.app.schemas import (
    CommunityReportCreate, CommunityReportStatusUpdate, CommunityReportOut
)

router = APIRouter(prefix="/api/reports", tags=["Community Reporting & Moderation"])

def redact_sensitive_pii(text: str) -> str:
    """
    Redacts sensitive Indian personal identifying information (Aadhaar, PAN, Card, Mobile numbers).
    """
    # 1. Indian Phone Numbers (10-digit mobile)
    text = re.sub(
        r"(\+?91[\s\-]?)?([6-9]\d{2})\d{4}(\d{3})",
        r"\1\2****\3",
        text
    )
    # 2. 12-digit Aadhaar Numbers (e.g. 1234 5678 9012 or 1234-5678-9012)
    text = re.sub(
        r"\b\d{4}[\s\-]?\d{4}[\s\-]?(\d{4})\b",
        r"XXXX-XXXX-\1",
        text
    )
    # 3. PAN card numbers (5 letters, 4 digits, 1 letter)
    text = re.sub(
        r"\b([A-Z]{5})\d{4}([A-Z])\b",
        r"\1****\2",
        text,
        flags=re.IGNORECASE
    )
    # 4. Bank Card numbers (16-digit cards)
    text = re.sub(
        r"\b\d{4}[\s\-]?\d{4}[\s\-]?\d{4}[\s\-]?(\d{4})\b",
        r"••••-••••-••••-\1",
        text
    )
    return text

@router.get("", response_model=list[CommunityReportOut])
async def list_reports(
    status: Optional[str] = Query(None, description="pending, reviewed, rejected, verified"),
    scam_type: Optional[str] = Query(None),
    state: Optional[str] = Query(None),
    limit: int = Query(50, le=200),
    db: AsyncSession = Depends(get_db)
):
    query = select(CommunityReport).order_by(desc(CommunityReport.created_at))
    if status:
        query = query.where(CommunityReport.status == status.lower())
    if scam_type:
        query = query.where(CommunityReport.scam_type == scam_type)
    if state:
        query = query.where(CommunityReport.location_state.ilike(f"%{state}%"))

    query = query.limit(limit)
    res = await db.execute(query)
    records = res.scalars().all()

    return [
        CommunityReportOut(
            id=r.id,
            identifier=r.identifier,
            scam_type=r.scam_type,
            incident_date=r.incident_date,
            location_state=r.location_state,
            location_district=r.location_district,
            description=r.description,
            loss_amount=r.loss_amount,
            evidence_notes=r.evidence_notes,
            status=r.status,
            confidence_score=r.confidence_score,
            moderation_notes=r.moderation_notes,
            created_at=r.created_at,
            updated_at=r.updated_at
        ) for r in records
    ]

@router.post("", response_model=CommunityReportOut)
async def create_report(req: CommunityReportCreate, db: AsyncSession = Depends(get_db)):
    # Redact sensitive PII from user text
    clean_identifier = redact_sensitive_pii(req.identifier.strip())
    clean_description = redact_sensitive_pii(req.description.strip())
    clean_notes = redact_sensitive_pii(req.evidence_notes.strip()) if req.evidence_notes else ""

    # Check recent duplicate (same identifier within current pending list)
    dup_res = await db.execute(
        select(CommunityReport).where(
            CommunityReport.identifier == clean_identifier,
            CommunityReport.status == "pending"
        ).limit(1)
    )
    if dup_res.scalars().first():
        # Elevate confidence score on duplicate report corroboration
        pass

    report = CommunityReport(
        identifier=clean_identifier,
        scam_type=req.scam_type,
        incident_date=req.incident_date,
        location_state=req.location_state,
        location_district=req.location_district,
        description=clean_description,
        loss_amount=req.loss_amount,
        evidence_notes=clean_notes,
        status="pending",
        confidence_score=0.60 if req.evidence_notes else 0.45,
        moderation_notes="Submitted by community member. Awaiting review under evidence policy."
    )
    db.add(report)
    await db.commit()
    await db.refresh(report)

    return CommunityReportOut(
        id=report.id,
        identifier=report.identifier,
        scam_type=report.scam_type,
        incident_date=report.incident_date,
        location_state=report.location_state,
        location_district=report.location_district,
        description=report.description,
        loss_amount=report.loss_amount,
        evidence_notes=report.evidence_notes,
        status=report.status,
        confidence_score=report.confidence_score,
        moderation_notes=report.moderation_notes,
        created_at=report.created_at,
        updated_at=report.updated_at
    )

@router.put("/{report_id}/status", response_model=CommunityReportOut)
async def update_report_status(
    report_id: int,
    req: CommunityReportStatusUpdate,
    db: AsyncSession = Depends(get_db)
):
    query = select(CommunityReport).where(CommunityReport.id == report_id)
    res = await db.execute(query)
    report = res.scalars().first()
    if not report:
        raise HTTPException(status_code=404, detail="Community report not found")

    report.status = req.status
    if req.status == "verified":
        report.confidence_score = 0.95
    elif req.status == "reviewed":
        report.confidence_score = 0.75
    elif req.status == "rejected":
        report.confidence_score = 0.10

    if req.moderation_notes:
        report.moderation_notes = f"{req.moderation_notes} (Audit: {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S UTC')})"

    await db.commit()
    await db.refresh(report)

    return CommunityReportOut(
        id=report.id,
        identifier=report.identifier,
        scam_type=report.scam_type,
        incident_date=report.incident_date,
        location_state=report.location_state,
        location_district=report.location_district,
        description=report.description,
        loss_amount=report.loss_amount,
        evidence_notes=report.evidence_notes,
        status=report.status,
        confidence_score=report.confidence_score,
        moderation_notes=report.moderation_notes,
        created_at=report.created_at,
        updated_at=report.updated_at
    )
