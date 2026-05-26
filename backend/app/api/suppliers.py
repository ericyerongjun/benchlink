from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.schemas.supplier import SupplierOut, SupplierListOut
from app.services import supplier_service

router = APIRouter(prefix="/suppliers")


@router.get("", response_model=SupplierListOut)
async def list_suppliers(
    component: str | None = Query(None),
    location: str | None = Query(None),
    country: str | None = Query(None),
    state: str | None = Query(None),
    city: str | None = Query(None),
    sort_by: str | None = Query(None, alias="sort_by"),
    sort_dir: str = Query("desc"),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, le=100),
    db: AsyncSession = Depends(get_db),
):
    suppliers, total = await supplier_service.list_suppliers(
        db=db,
        component=component,
        location=location,
        country=country,
        state=state,
        city=city,
        sort_by=sort_by,
        sort_dir=sort_dir,
        page=page,
        per_page=per_page,
    )
    return {
        "success": True,
        "data": [SupplierOut.model_validate(s) for s in suppliers],
        "meta": {"page": page, "per_page": per_page, "total": total},
    }


@router.get("/components")
async def list_component_types(db: AsyncSession = Depends(get_db)):
    components = await supplier_service.list_component_types(db)
    return {"success": True, "data": components}


@router.get("/locations")
async def list_locations(db: AsyncSession = Depends(get_db)):
    locations = await supplier_service.list_locations(db)
    return {"success": True, "data": locations}


@router.get("/{supplier_id}", response_model=dict)
async def get_supplier(supplier_id: int, db: AsyncSession = Depends(get_db)):
    supplier = await supplier_service.get_supplier(db, supplier_id)
    if not supplier:
        return {"success": False, "error": {"code": "NOT_FOUND", "message": "Supplier not found"}}
    return {"success": True, "data": SupplierOut.model_validate(supplier)}
