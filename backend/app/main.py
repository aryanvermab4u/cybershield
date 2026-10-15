from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.config import settings
from backend.app.database import init_db, AsyncSessionLocal
from backend.app.seed_data import seed_database
from backend.app.routers import (
    scan_router, stats_router, reports_router,
    hotspots_router, history_router
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database tables
    await init_db()
    # Seed initial demonstration benchmarks
    async with AsyncSessionLocal() as session:
        await seed_database(session)
    yield

app = FastAPI(
    title="CyberShield Intelligence API",
    description=(
        "Production-grade cybersecurity intelligence, explainable fraud detection, "
        "and scam prevention platform API. Powers real-time scanning for phone numbers, "
        "email headers, multilingual messages, URLs with SSRF protection, UPI VPAs, and QR destinations."
    ),
    version=settings.APP_VERSION,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Enable CORS for frontend Vite development server and production builds
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(scan_router)
app.include_router(stats_router)
app.include_router(reports_router)
app.include_router(hotspots_router)
app.include_router(history_router)

@app.get("/health", tags=["System Health"])
async def root_health():
    """Lightweight health check endpoint for Render / health monitors."""
    return {"status": "healthy"}

@app.get("/api/health", tags=["System Health"])
async def health_check():
    return {
        "status": "healthy",
        "platform": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT,
        "database": "SQLite (aiosqlite async)",
        "features": {
            "ssrf_protection": True,
            "multilingual_nlp": True,
            "telecom_circle_lookup": True,
            "email_header_parser": True,
            "upi_vpa_analyzer": True,
            "origin_intelligence": True
        }
    }

# Serve React SPA frontend build if dist folder exists
from pathlib import Path
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

FRONTEND_DIST = Path(__file__).resolve().parent.parent.parent / "frontend" / "dist"
if FRONTEND_DIST.exists():
    assets_dir = FRONTEND_DIST / "assets"
    if assets_dir.exists():
        app.mount("/assets", StaticFiles(directory=str(assets_dir)), name="assets")

    @app.get("/", include_in_schema=False)
    async def serve_root():
        index_file = FRONTEND_DIST / "index.html"
        if index_file.exists():
            return FileResponse(index_file)
        return {"status": "ok", "message": "CyberShield API active"}

    @app.get("/{full_path:path}", include_in_schema=False)
    async def serve_spa(full_path: str):
        if full_path.startswith("api/") or full_path in ("docs", "redoc", "openapi.json", "health"):
            return None
        file_path = FRONTEND_DIST / full_path
        if file_path.is_file():
            return FileResponse(file_path)
        index_file = FRONTEND_DIST / "index.html"
        if index_file.exists():
            return FileResponse(index_file)
        return {"status": "ok", "message": "CyberShield API active"}

