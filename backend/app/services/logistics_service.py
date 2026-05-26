from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.shipment import Shipment
from app.models.quote import Quote


async def list_shipments(db: AsyncSession) -> list[Shipment]:
    result = await db.execute(select(Shipment).order_by(Shipment.created_at.desc()))
    return list(result.scalars().all())


async def get_shipment(db: AsyncSession, shipment_id: str) -> Shipment | None:
    result = await db.execute(select(Shipment).where(Shipment.id == shipment_id))
    return result.scalar_one_or_none()


async def list_quotes(db: AsyncSession) -> list[Quote]:
    result = await db.execute(select(Quote).order_by(Quote.price_hkd))
    return list(result.scalars().all())
