from sqlalchemy import select, func, or_
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.supplier import Supplier


async def list_suppliers(
    db: AsyncSession,
    component: str | None = None,
    location: str | None = None,
    country: str | None = None,
    state: str | None = None,
    city: str | None = None,
    sort_by: str | None = None,
    sort_dir: str = "desc",
    page: int = 1,
    per_page: int = 20,
) -> tuple[list[Supplier], int]:
    query = select(Supplier).where(Supplier.is_active == True)

    if component:
        query = query.where(Supplier.components.contains([component]))

    if location:
        query = query.where(Supplier.location.contains(location))

    if country:
        query = query.where(Supplier.country == country)
    if state:
        query = query.where(Supplier.state == state)
    if city:
        query = query.where(Supplier.city == city)

    # Count
    count_query = select(func.count()).select_from(Supplier).where(Supplier.is_active == True)
    if component:
        count_query = count_query.where(Supplier.components.contains([component]))
    if location:
        count_query = count_query.where(Supplier.location.contains(location))
    if country:
        count_query = count_query.where(Supplier.country == country)
    if state:
        count_query = count_query.where(Supplier.state == state)
    if city:
        count_query = count_query.where(Supplier.city == city)
    total = (await db.execute(count_query)).scalar()

    # Sort
    sort_cols = {
        "match": Supplier.match_score,
        "stars": Supplier.stars,
        "lead_days": Supplier.lead_days,
        "price_low": Supplier.price_low,
    }
    col = sort_cols.get(sort_by, Supplier.match_score)
    query = query.order_by(col.desc() if sort_dir == "desc" else col.asc())

    # Paginate
    query = query.offset((page - 1) * per_page).limit(per_page)

    result = await db.execute(query)
    return list(result.scalars().all()), total


async def get_supplier(db: AsyncSession, supplier_id: int) -> Supplier | None:
    result = await db.execute(select(Supplier).where(Supplier.id == supplier_id))
    return result.scalar_one_or_none()


async def list_component_types(db: AsyncSession) -> list[str]:
    result = await db.execute(select(Supplier.components).where(Supplier.is_active == True))
    all_components: set[str] = set()
    for row in result.scalars().all():
        if row:
            all_components.update(row)
    return sorted(all_components)


async def list_locations(db: AsyncSession) -> list[str]:
    result = await db.execute(
        select(Supplier.location).where(Supplier.is_active == True).distinct()
    )
    return sorted(r for r in result.scalars().all())
