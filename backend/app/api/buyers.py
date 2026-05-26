from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, or_
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.models.buyer import Buyer
from app.schemas.buyer import BuyerOut, BuyerListOut, BuyerUpdate
from app.services import buyer_service

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
    """AI-powered buyer discovery."""
    product_description = payload.get("product_description", "")
    target_market = payload.get("target_market")

    desc_lower = product_description.lower()
    keyword_map = {
        "iot": "IoT", "sensor": "IoT Sensors", "pcb": "PCB Assemblies",
        "electronics": "Custom Electronics", "consumer": "Consumer Hardware",
        "robot": "Robotics Components", "wearable": "Wearables",
    }
    matched_interests = {
        interest for kw, interest in keyword_map.items() if kw in desc_lower
    }

    query = select(Buyer)
    if matched_interests:
        query = query.where(or_(*[Buyer.interest.contains(i) for i in matched_interests]))
    if target_market:
        query = query.where(Buyer.country.ilike(f"%{target_market}%"))

    query = query.order_by(Buyer.fit_score.desc()).limit(10)
    result = await db.execute(query)
    buyers = list(result.scalars().all())

    return {
        "success": True,
        "data": {
            "success": True,
            "count": len(buyers),
            "buyers": [
                {
                    "id": b.id, "name": b.name, "country_flag": b.country_flag,
                    "country": b.country, "fit_score": b.fit_score,
                    "interest": b.interest, "stage": b.stage,
                    "contact_name": b.contact_name, "contact_email": b.contact_email,
                    "last_contact": b.last_contact,
                }
                for b in buyers
            ],
        },
    }
