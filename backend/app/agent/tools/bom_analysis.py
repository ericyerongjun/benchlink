"""Parse structured BOM files to extract line items and component data."""
import csv
import io
import re

from app.agent.tools.base import BaseTool


class BOMAnalysisTool(BaseTool):
    name = "bom_analysis"
    description = (
        "Parse a structured Bill of Materials (BOM) file to extract line items, "
        "part numbers, descriptions, and quantities. "
        "Use this when the user uploads a CSV, Excel, or tabular BOM file. "
        "Do NOT use this for product descriptions — analyze those directly with your own knowledge."
    )

    def openai_tool_schema(self) -> dict:
        return {
            "type": "function",
            "function": {
                "name": self.name,
                "description": self.description,
                "parameters": {
                    "type": "object",
                    "properties": {
                        "bom_text": {
                            "type": "string",
                            "description": "The BOM file content as text (CSV rows, TSV, or tabular data)",
                        },
                    },
                    "required": ["bom_text"],
                },
            },
        }

    async def execute(self, bom_text: str) -> dict:
        lines = [l.strip() for l in bom_text.strip().split("\n") if l.strip()]

        # Try CSV parsing
        line_items = []
        try:
            reader = csv.DictReader(io.StringIO(bom_text))
            for row in reader:
                line_items.append({
                    "part_number": row.get("part_number") or row.get("Part Number") or row.get("MPN") or "",
                    "description": row.get("description") or row.get("Description") or row.get("desc") or "",
                    "quantity": int(row.get("qty") or row.get("quantity") or row.get("Qty") or 1),
                    "designator": row.get("designator") or row.get("Designator") or row.get("ref") or "",
                })
        except Exception:
            pass

        # If CSV parsing didn't yield results, try regex line extraction
        if not line_items:
            line_items = _extract_lines_fallback(lines)

        # Collect unique descriptions
        descriptions = [item.get("description", "") for item in line_items if item.get("description")]
        total_qty = sum(item.get("quantity", 0) for item in line_items)

        return {
            "success": True,
            "line_count": len(line_items),
            "line_items": line_items[:50],
            "descriptions": descriptions[:30],
            "total_quantity": total_qty,
            "note": "Use these component descriptions to search suppliers. Do NOT apply keyword matching — use your own electronics knowledge to identify what each part is.",
        }


def _extract_lines_fallback(lines: list[str]) -> list[dict]:
    """Fallback: try to extract line items from unstructured text."""
    items = []
    qty_pattern = re.compile(r"(\d+)\s*x?\s*", re.IGNORECASE)
    for line in lines:
        qty_match = qty_pattern.match(line)
        qty = int(qty_match.group(1)) if qty_match else 1
        desc = qty_pattern.sub("", line, 1).strip() if qty_match else line
        if desc:
            items.append({"part_number": "", "description": desc, "quantity": qty, "designator": ""})
    return items


bom_analysis_tool = BOMAnalysisTool()
