from fastapi import APIRouter

from app.api.health import router as health_router
from app.api.sourcing import router as sourcing_router
from app.api.suppliers import router as suppliers_router
from app.api.buyers import router as buyers_router
from app.api.logistics import router as logistics_router
from app.api.dashboard import router as dashboard_router
from app.api.activity import router as activity_router
from app.api.locations import router as locations_router

api_router = APIRouter(prefix="/api/v1")

api_router.include_router(health_router, tags=["health"])
api_router.include_router(sourcing_router, tags=["sourcing"])
api_router.include_router(suppliers_router, tags=["suppliers"])
api_router.include_router(buyers_router, tags=["buyers"])
api_router.include_router(logistics_router, tags=["logistics"])
api_router.include_router(dashboard_router, tags=["dashboard"])
api_router.include_router(activity_router, tags=["activity"])
api_router.include_router(locations_router, tags=["locations"])
