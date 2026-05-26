from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.schemas.dashboard import DashboardOut
from app.services import dashboard_service

router = APIRouter(prefix="/dashboard")


@router.get("/kpis", response_model=DashboardOut)
async def get_kpis(db: AsyncSession = Depends(get_db)):
    kpis = await dashboard_service.get_kpis(db)
    return {"success": True, "data": kpis}


@router.get("/activity", response_model=DashboardOut)
async def get_activity(db: AsyncSession = Depends(get_db)):
    activities = await dashboard_service.get_activity_feed(db)
    return {
        "success": True,
        "data": [
            {"tag": a.tag, "text": a.text, "time_label": a.time_label}
            for a in activities
        ],
    }


@router.get("/trends", response_model=DashboardOut)
async def get_trends(db: AsyncSession = Depends(get_db)):
    trends = await dashboard_service.get_trends(db)
    return {"success": True, "data": trends}


@router.get("/partners", response_model=DashboardOut)
async def get_partners(db: AsyncSession = Depends(get_db)):
    partners = await dashboard_service.get_partners(db)
    return {"success": True, "data": partners}
