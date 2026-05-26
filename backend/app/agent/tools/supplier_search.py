"""Search suppliers by component type, location, or capability."""
from sqlalchemy import select, or_
from sqlalchemy.ext.asyncio import AsyncSession

from app.agent.tools.base import BaseTool
from app.models.supplier import Supplier


class SupplierSearchTool(BaseTool):
    name = "supplier_search"
    description = (
        "Search the supplier database for manufacturers matching the required "
        "component types, location (country, state, city), and minimum match score. "
        "Use this when the user needs to find suppliers for specific components."
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
                        "component_types": {
                            "type": "array",
                            "items": {"type": "string"},
                            "description": "List of component types to search for (e.g. FR4 PCB, SMT Assembly, ENIG Finish)",
                        },
                        "country": {
                            "type": "string",
                            "description": "Optional country filter (e.g. China, United States, Germany)",
                        },
                        "state": {
                            "type": "string",
                            "description": "Optional state/province filter (e.g. Guangdong, California, Bavaria)",
                        },
                        "city": {
                            "type": "string",
                            "description": "Optional city filter (e.g. Shenzhen, San Jose, Munich)",
                        },
                        "min_match": {
                            "type": "integer",
                            "description": "Minimum match score threshold (0-100). Default 0.",
                        },
                    },
                    "required": ["component_types"],
                },
            },
        }

    async def execute(
        self,
        component_types: list[str],
        country: str | None = None,
        state: str | None = None,
        city: str | None = None,
        min_match: int = 0,
    ) -> dict:
        async with self._session_factory() as session:
            query = select(Supplier).where(Supplier.is_active == True)

            if component_types:
                conditions = [
                    Supplier.components.contains([ct]) for ct in component_types
                ]
                query = query.where(or_(*conditions))

            if country:
                query = query.where(Supplier.country == country)
            if state:
                query = query.where(Supplier.state == state)
            if city:
                query = query.where(Supplier.city == city)

            query = query.where(Supplier.match_score >= min_match)
            query = query.order_by(Supplier.match_score.desc())

            result = await session.execute(query)
            suppliers = result.scalars().all()

            return {
                "success": True,
                "count": len(suppliers),
                "suppliers": [
                    {
                        "id": s.id,
                        "name": s.name,
                        "location": s.location,
                        "country": s.country,
                        "state": s.state,
                        "city": s.city,
                        "match_score": s.match_score,
                        "stars": s.stars,
                        "lead_days": s.lead_days,
                        "lead_label": s.lead_label,
                        "price_low": s.price_low,
                        "price_high": s.price_high,
                        "price_label": s.price_label,
                        "components": s.components,
                        "certifications": s.certifications,
                        "min_order_qty": s.min_order_qty,
                    }
                    for s in suppliers
                ],
            }


supplier_search_tool = SupplierSearchTool(session_factory=None)
