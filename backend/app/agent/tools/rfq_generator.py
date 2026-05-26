"""Generate bilingual RFQ documents from selected suppliers."""
import uuid
from datetime import date

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.agent.tools.base import BaseTool
from app.agent.prompts.templates import RFQ_ENGLISH_SECTION, RFQ_CHINESE_SECTION
from app.models.supplier import Supplier


class RFQGeneratorTool(BaseTool):
    name = "generate_rfq"
    description = (
        "Generate a bilingual (English + Chinese) RFQ document for selected suppliers. "
        "Use this when the user wants to create a formal request for quotation."
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
                        "supplier_ids": {
                            "type": "array",
                            "items": {"type": "integer"},
                            "description": "List of supplier IDs to include in the RFQ",
                        },
                        "product": {
                            "type": "string",
                            "description": "Product name or description",
                        },
                        "quantity": {
                            "type": "integer",
                            "description": "Order quantity in units",
                        },
                        "specifications": {
                            "type": "string",
                            "description": "Technical specifications or requirements",
                        },
                        "deadline": {
                            "type": "string",
                            "description": "Quote submission deadline (e.g. 'May 20, 2026')",
                        },
                        "terms": {
                            "type": "string",
                            "description": "Payment and shipping terms (default: 'Net 30 · FOB Shenzhen')",
                        },
                    },
                    "required": ["supplier_ids", "product", "quantity", "specifications", "deadline"],
                },
            },
        }

    async def execute(
        self,
        supplier_ids: list[int],
        product: str,
        quantity: int,
        specifications: str,
        deadline: str,
        terms: str = "Net 30 · FOB Shenzhen",
    ) -> dict:
        async with self._session_factory() as session:
            result = await session.execute(
                select(Supplier).where(Supplier.id.in_(supplier_ids))
            )
            suppliers = result.scalars().all()

        rfq_number = f"RFQ-{date.today().strftime('%Y')}-{uuid.uuid4().hex[:4].upper()}"
        today_str = date.today().strftime("%B %d, %Y")

        supplier_list_en = "\n".join(
            f"  - {s.name} ({s.location})" for s in suppliers
        )
        supplier_list_zh = "\n".join(
            f"  - {s.name}（{s.location}）" for s in suppliers
        )

        english_content = {
            "rfq_number": rfq_number,
            "product": product,
            "quantity": quantity,
            "specifications": specifications,
            "deadline": deadline,
            "terms": terms,
            "suppliers": [
                {"id": s.id, "name": s.name, "location": s.location} for s in suppliers
            ],
            "body": RFQ_ENGLISH_SECTION.format(
                rfq_number=rfq_number,
                date=today_str,
                product=product,
                quantity=quantity,
                specifications=specifications,
                deadline=deadline,
                terms=terms,
                supplier_list=supplier_list_en,
            ),
        }

        chinese_content = {
            "rfq_number": rfq_number,
            "product": product,
            "quantity": quantity,
            "specifications": specifications,
            "deadline": deadline,
            "terms": terms,
            "body": RFQ_CHINESE_SECTION.format(
                rfq_number=rfq_number,
                date=today_str,
                product=product,
                quantity=quantity,
                specifications=specifications,
                deadline=deadline,
                terms=terms,
                supplier_list=supplier_list_zh,
            ),
        }

        return {
            "success": True,
            "rfq_number": rfq_number,
            "product": product,
            "quantity": quantity,
            "specifications": specifications,
            "deadline": deadline,
            "terms": terms,
            "supplier_ids": supplier_ids,
            "english_content": english_content,
            "chinese_content": chinese_content,
        }

