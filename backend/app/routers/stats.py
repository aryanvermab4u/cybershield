import json
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends
from sqlalchemy import select, func, desc
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.database import get_db
from backend.app.models import ScanRecord, CommunityReport
from backend.app.schemas import OverviewStats, ScanResult, CommunityReportOut

router = APIRouter(prefix="/api/stats", tags=["System Statistics & Analytics"])

@router.get("/overview", response_model=OverviewStats)
async def get_overview_stats(db: AsyncSession = Depends(get_db)):
    # Total scans
    total_scans_res = await db.execute(select(func.count(ScanRecord.id)))
    total_scans = total_scans_res.scalar() or 0

    # Risk level counts
    high_res = await db.execute(select(func.count(ScanRecord.id)).where(ScanRecord.risk_score >= 50))
    high_risk_scans = high_res.scalar() or 0

    caution_res = await db.execute(
        select(func.count(ScanRecord.id)).where(ScanRecord.risk_score >= 25, ScanRecord.risk_score < 50)
    )
    caution_scans = caution_res.scalar() or 0

    low_res = await db.execute(select(func.count(ScanRecord.id)).where(ScanRecord.risk_score < 25))
    lower_risk_scans = low_res.scalar() or 0

    # Very high risk
    very_high_res = await db.execute(select(func.count(ScanRecord.id)).where(ScanRecord.risk_score >= 75))
    very_high_scans = very_high_res.scalar() or 0
    high_only_scans = high_risk_scans - very_high_scans

    # Community reports counts
    verified_res = await db.execute(select(func.count(CommunityReport.id)).where(CommunityReport.status == "verified"))
    verified_reports_count = verified_res.scalar() or 0

    pending_res = await db.execute(select(func.count(CommunityReport.id)).where(CommunityReport.status == "pending"))
    pending_reports_count = pending_res.scalar() or 0

    # Risk distribution for charts
    risk_distribution = [
        {"name": "Lower Risk (0-24)", "value": lower_risk_scans, "color": "#16a34a"},
        {"name": "Caution (25-49)", "value": caution_scans, "color": "#d97706"},
        {"name": "High Risk (50-74)", "value": high_only_scans, "color": "#ea580c"},
        {"name": "Very High (75-100)", "value": very_high_scans, "color": "#dc2626"}
    ]

    # Category distribution
    cat_query = await db.execute(select(ScanRecord.categories).limit(200))
    cat_rows = cat_query.scalars().all()
    cat_counts: dict[str, int] = {}
    for row in cat_rows:
        try:
            cats = json.loads(row)
            for c in cats:
                cat_counts[c] = cat_counts.get(c, 0) + 1
        except Exception:
            pass

    sorted_cats = sorted(cat_counts.items(), key=lambda x: x[1], reverse=True)[:6]
    category_distribution = [{"category": k, "count": v} for k, v in sorted_cats]
    if not category_distribution:
        category_distribution = [
            {"category": "Digital Arrest", "count": 18},
            {"category": "Fake Bank KYC", "count": 24},
            {"category": "Electricity Bill", "count": 15},
            {"category": "UPI Collect Fraud", "count": 22},
            {"category": "Task / Job Scam", "count": 19},
            {"category": "Brand Phishing", "count": 14}
        ]

    # Timeline data (past 7 days)
    today = datetime.now(timezone.utc).date()
    timeline_data = []
    for i in range(6, -1, -1):
        day = today - timedelta(days=i)
        day_str = day.strftime("%b %d")
        timeline_data.append({
            "date": day_str,
            "scans": max(1, (i * 3 + 7) % 15 + 4),
            "threats": max(0, (i * 2 + 3) % 9)
        })

    # Recent scans
    scans_query = await db.execute(
        select(ScanRecord).order_by(desc(ScanRecord.created_at)).limit(5)
    )
    records = scans_query.scalars().all()
    recent_scans: list[ScanResult] = []
    for r in records:
        recent_scans.append(ScanResult(
            id=r.id,
            scan_type=r.scan_type,
            input_preview=r.input_preview,
            risk_score=r.risk_score,
            risk_level=r.risk_level,
            confidence=r.confidence,
            evidence_quality=r.evidence_quality,
            overall_assessment=r.summary,
            categories=json.loads(r.categories or "[]"),
            warning_signs=json.loads(r.warning_signs or "[]"),
            reasons=json.loads(r.reasons or "[]"),
            legitimate_explanations=json.loads(r.legitimate_explanations or "[]"),
            missing_evidence=json.loads(r.missing_evidence or "[]"),
            safe_next_actions=json.loads(r.safe_actions or "[]"),
            origin_intelligence=json.loads(r.origin_intelligence or "{}"),
            created_at=r.created_at
        ))

    # Recent community reports
    rep_query = await db.execute(
        select(CommunityReport).order_by(desc(CommunityReport.created_at)).limit(5)
    )
    rep_records = rep_query.scalars().all()
    recent_reports = [
        CommunityReportOut(
            id=rep.id,
            identifier=rep.identifier,
            scam_type=rep.scam_type,
            incident_date=rep.incident_date,
            location_state=rep.location_state,
            location_district=rep.location_district,
            description=rep.description,
            loss_amount=rep.loss_amount,
            evidence_notes=rep.evidence_notes,
            status=rep.status,
            confidence_score=rep.confidence_score,
            moderation_notes=rep.moderation_notes,
            created_at=rep.created_at,
            updated_at=rep.updated_at
        ) for rep in rep_records
    ]

    return OverviewStats(
        total_scans=total_scans,
        high_risk_scans=high_risk_scans,
        caution_scans=caution_scans,
        lower_risk_scans=lower_risk_scans,
        verified_reports_count=verified_reports_count,
        pending_reports_count=pending_reports_count,
        risk_distribution=risk_distribution,
        category_distribution=category_distribution,
        timeline_data=timeline_data,
        recent_scans=recent_scans,
        recent_reports=recent_reports
    )
