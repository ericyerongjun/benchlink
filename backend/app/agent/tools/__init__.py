from app.agent.tools.base import BaseTool
from app.agent.tools.supplier_search import SupplierSearchTool
from app.agent.tools.bom_analysis import BOMAnalysisTool
from app.agent.tools.rfq_generator import RFQGeneratorTool
from app.agent.tools.buyer_discovery import BuyerDiscoveryTool
from app.agent.tools.logistics_quote import LogisticsQuoteTool
from app.agent.tools.shipment_tracker import ShipmentTrackerTool


def create_tools(session_factory) -> list[BaseTool]:
    """Create all tools wired with the given DB session factory."""
    return [
        SupplierSearchTool(session_factory=session_factory),
        BOMAnalysisTool(),
        RFQGeneratorTool(session_factory=session_factory),
        BuyerDiscoveryTool(session_factory=session_factory),
        LogisticsQuoteTool(session_factory=session_factory),
        ShipmentTrackerTool(session_factory=session_factory),
    ]


__all__ = [
    "BaseTool",
    "create_tools",
    "SupplierSearchTool",
    "BOMAnalysisTool",
    "RFQGeneratorTool",
    "BuyerDiscoveryTool",
    "LogisticsQuoteTool",
    "ShipmentTrackerTool",
]
