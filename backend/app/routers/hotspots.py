import json
from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.database import get_db
from backend.app.models import HotspotArea
from backend.app.schemas import HotspotOut

router = APIRouter(prefix="/api/hotspots", tags=["Scam Hotspots & Geointelligence"])

@router.get("", response_model=list[HotspotOut])
async def list_hotspots(
    state: Optional[str] = Query(None),
    min_reports: int = Query(5, description="Minimum report threshold before displaying hotspot"),
    db: AsyncSession = Depends(get_db)
):
    query = select(HotspotArea).where(HotspotArea.report_count >= min_reports)
    if state:
        query = query.where(HotspotArea.state.ilike(f"%{state}%"))

    res = await db.execute(query)
    records = res.scalars().all()

    return [
        HotspotOut(
            id=h.id,
            state=h.state,
            district=h.district,
            latitude=h.latitude,
            longitude=h.longitude,
            report_count=h.report_count,
            verified_count=h.verified_count,
            dominant_categories=json.loads(h.dominant_categories or "[]"),
            risk_index=h.risk_index,
            trend=h.trend,
            evidence_status=h.evidence_status,
            updated_at=h.updated_at
        ) for h in records
    ]
