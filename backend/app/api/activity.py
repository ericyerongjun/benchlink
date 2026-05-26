from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.schemas.activity import ActivityListOut, ActivityOut
from app.services import dashboard_service

router = APIRouter(prefix="/activity")


@router.get("", response_model=ActivityListOut)
async def list_activities(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, le=100),
    db: AsyncSession = Depends(get_db),
):
    activities = await dashboard_service.get_activity_feed(db, limit=per_page)
    return {
        "success": True,
        "data": [ActivityOut.model_validate(a) for a in activities],
        "meta": {"page": page, "per_page": per_page},
    }
