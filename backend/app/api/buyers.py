from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.schemas.buyer import BuyerOut, BuyerListOut, BuyerUpdate
from app.services import buyer_service
from app.services import dashboard_service

router = APIRouter(prefix="/buyers")


@router.get("", response_model=BuyerListOut)
async def list_buyers(
    stage: str | None = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, le=100),
    db: AsyncSession = Depends(get_db),
):
    buyers, total = await buyer_service.list_buyers(db, stage=stage, page=page, per_page=per_page)
    return {
        "success": True,
        "data": [BuyerOut.model_validate(b) for b in buyers],
        "meta": {"page": page, "per_page": per_page, "total": total},
    }


@router.get("/{buyer_id}")
async def get_buyer(buyer_id: int, db: AsyncSession = Depends(get_db)):
    buyer = await buyer_service.get_buyer(db, buyer_id)
    if not buyer:
        return {"success": False, "error": {"code": "NOT_FOUND", "message": "Buyer not found"}}
    return {"success": True, "data": BuyerOut.model_validate(buyer)}


@router.patch("/{buyer_id}")
async def update_buyer(
    buyer_id: int,
    payload: BuyerUpdate,
    db: AsyncSession = Depends(get_db),
):
    buyer = await buyer_service.update_buyer(
        db, buyer_id, stage=payload.stage, notes=payload.notes, fit_score=payload.fit_score,
    )
    if not buyer:
        return {"success": False, "error": {"code": "NOT_FOUND", "message": "Buyer not found"}}
    return {"success": True, "data": BuyerOut.model_validate(buyer)}


@router.post("/discover")
async def discover_buyers(
    payload: dict,
    db: AsyncSession = Depends(get_db),
):
    """AI-powered buyer discovery. Uses agent tool under the hood."""
    from app.agent.tools.buyer_discovery import buyer_discovery_tool
    result = await buyer_discovery_tool.execute(
        product_description=payload.get("product_description", ""),
        target_market=payload.get("target_market"),
    )
    return {"success": True, "data": result}
