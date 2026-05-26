from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.buyer import Buyer


async def list_buyers(
    db: AsyncSession,
    stage: str | None = None,
    page: int = 1,
    per_page: int = 20,
) -> tuple[list[Buyer], int]:
    query = select(Buyer)
    count_query = select(func.count()).select_from(Buyer)

    if stage:
        query = query.where(Buyer.stage == stage)
        count_query = count_query.where(Buyer.stage == stage)

    query = query.order_by(Buyer.fit_score.desc())
    total = (await db.execute(count_query)).scalar()
    query = query.offset((page - 1) * per_page).limit(per_page)

    result = await db.execute(query)
    return list(result.scalars().all()), total


async def get_buyer(db: AsyncSession, buyer_id: int) -> Buyer | None:
    result = await db.execute(select(Buyer).where(Buyer.id == buyer_id))
    return result.scalar_one_or_none()


async def update_buyer(
    db: AsyncSession,
    buyer_id: int,
    stage: str | None = None,
    notes: str | None = None,
    fit_score: float | None = None,
) -> Buyer | None:
    buyer = await get_buyer(db, buyer_id)
    if not buyer:
        return None
    if stage is not None:
        buyer.stage = stage
    if notes is not None:
        buyer.notes = notes
    if fit_score is not None:
        buyer.fit_score = fit_score
    await db.commit()
    await db.refresh(buyer)
    return buyer
