"""Get real shipping quote estimates from carrier database using the calculator."""
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.agent.tools.base import BaseTool
from app.models.carrier import Carrier
from app.services.logistics_calculator import calculate_quote


class LogisticsQuoteTool(BaseTool):
    name = "logistics_quote"
    description = (
        "Get estimated shipping quotes from carriers for a given route and cargo. "
        "Returns quotes from parcel, air freight, and ocean carriers with pricing, "
        "transit times, and CO2 estimates. "
        "Use this when the user asks about shipping costs or transit times."
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
                        "origin": {
                            "type": "string",
                            "description": "Origin city or port (e.g. Shenzhen, Hong Kong, Guangzhou, Shanghai)",
                        },
                        "destination": {
                            "type": "string",
                            "description": "Destination city or country (e.g. Frankfurt, Los Angeles, Tokyo, London)",
                        },
                        "cargo_type": {
                            "type": "string",
                            "description": "Type of cargo (e.g. Electronics, Machinery, PCBs)",
                        },
                        "weight_kg": {
                            "type": "number",
                            "description": "Total cargo weight in kilograms",
                        },
                        "length_cm": {
                            "type": "number",
                            "description": "Package length in cm (optional, for volumetric weight)",
                        },
                        "width_cm": {
                            "type": "number",
                            "description": "Package width in cm (optional)",
                        },
                        "height_cm": {
                            "type": "number",
                            "description": "Package height in cm (optional)",
                        },
                        "quantity": {
                            "type": "integer",
                            "description": "Number of packages (default 1)",
                        },
                        "urgency": {
                            "type": "string",
                            "enum": ["express", "standard", "economy"],
                            "description": "Delivery urgency level",
                        },
                    },
                    "required": ["origin", "destination"],
                },
            },
        }

    async def execute(
        self,
        origin: str,
        destination: str,
        cargo_type: str = "Electronics",
        weight_kg: float = 10,
        length_cm: float = 0,
        width_cm: float = 0,
        height_cm: float = 0,
        quantity: int = 1,
        urgency: str = "standard",
    ) -> dict:
        async with self._session_factory() as session:
            # Get active carriers by category
            result = await session.execute(
                select(Carrier).where(Carrier.is_active == True).order_by(Carrier.category, Carrier.base_rate_per_kg)
            )
            carriers = result.scalars().all()

        # Build quotes for each carrier using the calculator
        quotes = []
        for c in carriers:
            q = calculate_quote(
                origin=origin,
                destination=destination,
                weight_kg=weight_kg,
                category=c.category,
                urgency=urgency,
                length_cm=length_cm,
                width_cm=width_cm,
                height_cm=height_cm,
                base_rate_per_kg=c.base_rate_per_kg,
                quantity=quantity,
            )
            quotes.append({
                "carrier": c.name,
                "category": c.category,
                "service": _service_label(c.category),
                "transit_min_days": max(c.min_transit_days, q["transit_min_days"]),
                "transit_max_days": max(c.max_transit_days, q["transit_max_days"]),
                "transit": f"{max(c.min_transit_days, q['transit_min_days'])}–{max(c.max_transit_days, q['transit_max_days'])} days",
                "price_hkd": q["price_hkd"],
                "price_usd": q["price_usd"],
                "co2_kg": q["co2_kg"],
                "country": c.country or "",
                "breakdown": q["breakdown"],
            })

        # Sort by price ascending, then group by category
        quotes.sort(key=lambda x: x["price_hkd"])

        # Select best from each category + top overall
        seen_categories = set()
        top_quotes = []
        for q in quotes:
            if q["category"] not in seen_categories:
                seen_categories.add(q["category"])
                top_quotes.append(q)
            if len(top_quotes) >= 12:
                break

        return {
            "success": True,
            "origin": origin,
            "destination": destination,
            "cargo_type": cargo_type,
            "weight_kg": weight_kg,
            "quantity": quantity,
            "quotes": top_quotes,
        }


def _service_label(category: str) -> str:
    return {
        "parcel": "International Express",
        "air_freight": "Air Freight Cargo",
        "ocean": "Ocean Freight",
        "forwarder": "Freight Forwarding",
    }.get(category, "Logistics Service")

