from fastapi import APIRouter, Depends, Request
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.schemas.shipment import ShipmentOut, ShipmentListOut
from app.schemas.quote import QuoteRequest
from app.services import logistics_service
from app.models.carrier import Carrier

router = APIRouter(prefix="/logistics")


def _get_logistics_tool(request: Request):
    """Get the logistics_quote tool from the agent engine's tool registry."""
    engine = request.app.state.agent_engine
    return engine.tools.get("logistics_quote")


@router.post("/quotes")
async def get_quotes(payload: QuoteRequest, request: Request):
    tool = _get_logistics_tool(request)
    if not tool:
        return {"success": False, "error": {"code": "TOOL_NOT_FOUND", "message": "Logistics tool not available"}}

    result = await tool.execute(
        origin=payload.origin,
        destination=payload.destination,
        cargo_type=payload.cargo_type,
        weight_kg=payload.weight_kg,
        length_cm=payload.length_cm,
        width_cm=payload.width_cm,
        height_cm=payload.height_cm,
        quantity=payload.quantity,
        urgency=payload.urgency,
    )
    return {"success": True, "data": result.get("quotes", [])}


@router.get("/carriers")
async def list_carriers(
    category: str | None = None,
    db: AsyncSession = Depends(get_db),
):
    query = select(Carrier).where(Carrier.is_active == True).order_by(Carrier.category, Carrier.name)
    if category:
        query = query.where(Carrier.category == category)
    result = await db.execute(query)
    carriers = result.scalars().all()
    return {
        "success": True,
        "data": [
            {
                "id": c.id,
                "name": c.name,
                "category": c.category,
                "country": c.country,
                "service_area": c.service_area,
                "min_transit_days": c.min_transit_days,
                "max_transit_days": c.max_transit_days,
            }
            for c in carriers
        ],
    }


@router.get("/shipments", response_model=ShipmentListOut)
async def list_shipments(db: AsyncSession = Depends(get_db)):
    shipments = await logistics_service.list_shipments(db)
    return {
        "success": True,
        "data": [ShipmentOut.model_validate(s) for s in shipments],
    }


@router.get("/shipments/{shipment_id}")
async def get_shipment(shipment_id: str, db: AsyncSession = Depends(get_db)):
    shipment = await logistics_service.get_shipment(db, shipment_id)
    if not shipment:
        return {"success": False, "error": {"code": "NOT_FOUND", "message": "Shipment not found"}}
    return {"success": True, "data": ShipmentOut.model_validate(shipment)}


@router.get("/shipments/{shipment_id}/track")
async def track_shipment(shipment_id: str, db: AsyncSession = Depends(get_db)):
    from app.agent.tools.shipment_tracker import shipment_tracker_tool
    result = await shipment_tracker_tool.execute(shipment_id=shipment_id)
    return {"success": result["success"], "data": result}
