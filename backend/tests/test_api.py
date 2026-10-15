import pytest
from httpx import AsyncClient, ASGITransport
from backend.app.main import app
from backend.app.database import init_db, AsyncSessionLocal
from backend.app.seed_data import seed_database

@pytest.mark.anyio
async def test_health_endpoint():
    await init_db()
    async with AsyncSessionLocal() as session:
        await seed_database(session)

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert data["features"]["ssrf_protection"] is True

@pytest.mark.anyio
async def test_universal_scan_endpoint():
    await init_db()
    async with AsyncSessionLocal() as session:
        await seed_database(session)

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # Test scanning an electricity scam SMS
        payload = {
            "content": "Dear customer your electricity power will be disconnected at 9.30 pm tonight call officer 9876543210",
            "scan_hint": "auto",
            "save_history": True
        }
        response = await ac.post("/api/scan/universal", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["risk_score"] >= 45
        assert "Electricity Bill Disconnection Scam" in data["categories"]
        assert len(data["safe_next_actions"]) > 0

@pytest.mark.anyio
async def test_stats_and_hotspots_endpoints():
    await init_db()
    async with AsyncSessionLocal() as session:
        await seed_database(session)

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        stats_resp = await ac.get("/api/stats/overview")
        assert stats_resp.status_code == 200
        stats = stats_resp.json()
        assert "risk_distribution" in stats
        assert len(stats["timeline_data"]) == 7

        hotspots_resp = await ac.get("/api/hotspots")
        assert hotspots_resp.status_code == 200
        hotspots = hotspots_resp.json()
        assert len(hotspots) > 0
        assert any("Jamtara" in h["district"] or "Nuh" in h["district"] for h in hotspots)
