"""Find buyer leads matching a product description."""
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.agent.tools.base import BaseTool
from app.models.buyer import Buyer


class BuyerDiscoveryTool(BaseTool):
    name = "buyer_discovery"
    description = (
        "Search for potential buyer leads matching a product profile or description. "
        "Use this when the user wants to find buyers interested in specific products."
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
                        "product_description": {
                            "type": "string",
                            "description": "Description of the product or category to find buyers for",
                        },
                        "target_market": {
                            "type": "string",
                            "description": "Optional target market country or region (e.g. Germany, USA, Europe)",
                        },
                    },
                    "required": ["product_description"],
                },
            },
        }

    async def execute(self, product_description: str, target_market: str | None = None) -> dict:
        async with self._session_factory() as session:
            query = select(Buyer)

            desc_lower = product_description.lower()
            conditions = []

            keyword_map = {
                "iot": "IoT",
                "sensor": "IoT Sensors",
                "pcb": "PCB Assemblies",
                "electronics": "Custom Electronics",
                "consumer": "Consumer Hardware",
                "robot": "Robotics Components",
                "wearable": "Wearables",
            }

            matched_interests = set()
            for kw, interest in keyword_map.items():
                if kw in desc_lower:
                    matched_interests.add(interest)

            if matched_interests:
                from sqlalchemy import or_
                query = query.where(or_(*[
                    Buyer.interest.contains(interest) for interest in matched_interests
                ]))

            if target_market:
                query = query.where(Buyer.country.ilike(f"%{target_market}%"))

            query = query.order_by(Buyer.fit_score.desc()).limit(10)

            result = await session.execute(query)
            buyers = result.scalars().all()

            return {
                "success": True,
                "count": len(buyers),
                "buyers": [
                    {
                        "id": b.id,
                        "name": b.name,
                        "country_flag": b.country_flag,
                        "country": b.country,
                        "fit_score": b.fit_score,
                        "interest": b.interest,
                        "stage": b.stage,
                        "contact_name": b.contact_name,
                        "contact_email": b.contact_email,
                        "last_contact": b.last_contact,
                    }
                    for b in buyers
                ],
            }


buyer_discovery_tool = BuyerDiscoveryTool(session_factory=None)
