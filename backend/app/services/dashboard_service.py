from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.supplier import Supplier
from app.models.buyer import Buyer
from app.models.shipment import Shipment
from app.models.sourcing_request import SourcingSession
from app.models.activity import Activity


async def get_kpis(db: AsyncSession) -> dict:
    active_sourcing = (await db.execute(
        select(func.count()).select_from(SourcingSession).where(SourcingSession.status == "active")
    )).scalar()
    open_leads = (await db.execute(
        select(func.count()).select_from(Buyer).where(Buyer.stage.in_(["Identified", "Contacted"]))
    )).scalar()
    pending_shipments = (await db.execute(
        select(func.count()).select_from(Shipment).where(Shipment.status == "in_transit")
    )).scalar()
    return {
        "active_sourcing": active_sourcing or 0,
        "open_buyer_leads": open_leads or 0,
        "pending_shipments": pending_shipments or 0,
    }


async def get_activity_feed(db: AsyncSession, limit: int = 10) -> list[Activity]:
    result = await db.execute(
        select(Activity).order_by(Activity.created_at.desc()).limit(limit)
    )
    return list(result.scalars().all())


async def get_trends(db: AsyncSession) -> list[dict]:
    """Return mock trend data (in production this would aggregate real data)."""
    return [
        {"week": "Wk 1", "requests": 4}, {"week": "Wk 2", "requests": 6},
        {"week": "Wk 3", "requests": 5}, {"week": "Wk 4", "requests": 9},
        {"week": "Wk 5", "requests": 7}, {"week": "Wk 6", "requests": 11},
        {"week": "Wk 7", "requests": 10}, {"week": "Wk 8", "requests": 12},
    ]


async def get_partners(db: AsyncSession) -> dict:
    suppliers_result = await db.execute(
        select(Supplier).where(Supplier.is_active == True).order_by(Supplier.match_score.desc())
    )
    suppliers = suppliers_result.scalars().all()

    buyers_result = await db.execute(
        select(Buyer).order_by(Buyer.fit_score.desc())
    )
    buyers = buyers_result.scalars().all()

    return {
        "suppliers": [
            {"name": s.name, "location": s.location, "match_score": s.match_score,
             "components": s.components}
            for s in suppliers
        ],
        "buyers": [
            {"name": b.name, "interest": b.interest, "stage": b.stage,
             "fit_score": b.fit_score, "country": b.country}
            for b in buyers
        ],
    }
