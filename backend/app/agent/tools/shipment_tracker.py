"""Track a shipment by its ID."""
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.agent.tools.base import BaseTool
from app.models.shipment import Shipment


class ShipmentTrackerTool(BaseTool):
    name = "track_shipment"
    description = (
        "Track a shipment by its tracking ID and return its current status "
        "and stage-by-stage progress. Use this when the user asks about shipment status."
    )

    def __init__(self, session_factory) -> None:
        self._session_factory = session_factory

    def openai_tool_schema(self) -> dict:
        return {
            "type": "function",
            "function": {
                "name": self.name,
                "description": self.description,
                "parameters": {
                    "type": "object",
                    "properties": {
                        "shipment_id": {
                            "type": "string",
                            "description": "The shipment tracking ID (e.g. DHL-883821, SF-449021)",
                        },
                    },
                    "required": ["shipment_id"],
                },
            },
        }

    async def execute(self, shipment_id: str) -> dict:
        async with self._session_factory() as session:
            result = await session.execute(
                select(Shipment).where(Shipment.id == shipment_id)
            )
            shipment = result.scalar_one_or_none()

            if not shipment:
                return {
                    "success": False,
                    "error": f"Shipment {shipment_id} not found",
                }

            stages = shipment.stages or []
            completed = sum(1 for s in stages if s.get("done"))
            current_stage = None
            for s in stages:
                if s.get("current"):
                    current_stage = s["label"]
                    break

            return {
                "success": True,
                "shipment_id": shipment.id,
                "status": shipment.status,
                "origin": shipment.origin,
                "destination": shipment.destination,
                "carrier": shipment.carrier,
                "buyer": shipment.buyer_name,
                "progress": f"{completed}/{len(stages)}",
                "current_stage": current_stage or "Completed" if shipment.status == "delivered" else "In transit",
                "stages": stages,
            }


shipment_tracker_tool = ShipmentTrackerTool(session_factory=None)
