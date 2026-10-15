import io
import csv
import json
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy import select, desc, delete
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.database import get_db
from backend.app.models import ScanRecord
from backend.app.schemas import ScanResult

router = APIRouter(prefix="/api/history", tags=["Scan History"])

@router.get("", response_model=list[ScanResult])
async def list_history(
    scan_type: Optional[str] = Query(None),
    risk_level: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    limit: int = Query(50, le=200),
    db: AsyncSession = Depends(get_db)
):
    query = select(ScanRecord).order_by(desc(ScanRecord.created_at))
    if scan_type and scan_type != "all":
        query = query.where(ScanRecord.scan_type == scan_type)
    if risk_level and risk_level != "all":
        query = query.where(ScanRecord.risk_level == risk_level)
    if search:
        query = query.where(ScanRecord.input_preview.ilike(f"%{search}%"))

    query = query.limit(limit)
    res = await db.execute(query)
    records = res.scalars().all()

    return [
        ScanResult(
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
        ) for r in records
    ]

@router.delete("/{record_id}")
async def delete_history_item(record_id: int, db: AsyncSession = Depends(get_db)):
    query = select(ScanRecord).where(ScanRecord.id == record_id)
    res = await db.execute(query)
    item = res.scalars().first()
    if not item:
        raise HTTPException(status_code=404, detail="Scan record not found")

    await db.delete(item)
    await db.commit()
    return {"status": "success", "message": f"Scan record #{record_id} deleted"}

@router.delete("")
async def clear_all_history(db: AsyncSession = Depends(get_db)):
    await db.execute(delete(ScanRecord))
    await db.commit()
    return {"status": "success", "message": "All scan history cleared"}

@router.get("/export")
async def export_history_csv(db: AsyncSession = Depends(get_db)):
    query = select(ScanRecord).order_by(desc(ScanRecord.created_at)).limit(500)
    res = await db.execute(query)
    records = res.scalars().all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["ID", "Timestamp (UTC)", "Scan Type", "Target Preview", "Risk Score", "Risk Level", "Confidence", "Categories", "Assessment"])

    for r in records:
        cats = ", ".join(json.loads(r.categories or "[]"))
        writer.writerow([
            r.id,
            r.created_at.strftime("%Y-%m-%d %H:%M:%S") if r.created_at else "",
            r.scan_type,
            r.input_preview,
            r.risk_score,
            r.risk_level,
            r.confidence,
            cats,
            r.summary.replace("\n", " ")
        ])

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=cybershield_scan_history.csv"}
    )
