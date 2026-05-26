"""Hierarchical location selector endpoints."""
from fastapi import APIRouter, Depends
from sqlalchemy import select, distinct
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.models.location import Location
from app.schemas.location import LocationOut, LocationListOut

router = APIRouter(prefix="/locations")


@router.get("", response_model=LocationListOut)
async def list_all_locations(db: AsyncSession = Depends(get_db)):
    """Return all locations as structured records."""
    result = await db.execute(
        select(Location).order_by(Location.country, Location.state, Location.city)
    )
    locations = result.scalars().all()
    return {"success": True, "data": [LocationOut.model_validate(l) for l in locations]}


@router.get("/countries")
async def list_countries(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(distinct(Location.country)).order_by(Location.country)
    )
    countries = result.scalars().all()
    return {"success": True, "data": list(countries)}


@router.get("/{country}/states")
async def list_states(country: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(distinct(Location.state))
        .where(Location.country == country, Location.state.isnot(None))
        .order_by(Location.state)
    )
    states = [s for s in result.scalars().all() if s]
    return {"success": True, "data": states}


@router.get("/{country}/{state}/cities")
async def list_cities(
    country: str,
    state: str,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(distinct(Location.city))
        .where(
            Location.country == country,
            Location.state == state,
            Location.city.isnot(None),
        )
        .order_by(Location.city)
    )
    cities = [c for c in result.scalars().all() if c]
    return {"success": True, "data": cities}
