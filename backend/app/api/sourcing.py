"""Sourcing API — agentic chat with the ReAct agent."""
import uuid

from fastapi import APIRouter, Depends, File, Request, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.schemas.sourcing import (
    SourcingSessionCreate,
    SourcingSessionOut,
    SourcingMessageCreate,
    SourcingMessageOut,
    RFQCreate,
    RFQOut,
)
from app.services import sourcing_service

router = APIRouter(prefix="/sourcing")


def _get_engine(request: Request):
    return request.app.state.agent_engine


@router.get("/components")
async def get_accumulated_components(
    db: AsyncSession = Depends(get_db),
):
    components = await sourcing_service.get_accumulated_components(db)
    return {"success": True, "data": components}


@router.post("/sessions")
async def create_session(
    payload: SourcingSessionCreate | None = None,
    db: AsyncSession = Depends(get_db),
):
    s = await sourcing_service.create_session(
        db, title=payload.title if payload else None
    )
    return {"success": True, "data": SourcingSessionOut.model_validate(s)}


@router.get("/sessions/{session_id}")
async def get_session(
    session_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    s = await sourcing_service.get_session(db, session_id)
    if not s:
        return {"success": False, "error": {"code": "NOT_FOUND", "message": "Session not found"}}

    messages = await sourcing_service.get_messages(db, session_id)
    matched = await sourcing_service.get_matched_suppliers(db, session_id)

    return {
        "success": True,
        "data": {
            "session": SourcingSessionOut.model_validate(s),
            "messages": [SourcingMessageOut.model_validate(m) for m in messages],
            "matched_suppliers": [
                {"id": sup.id, "name": sup.name, "location": sup.location,
                 "match_score": sup.match_score, "components": sup.components}
                for sup in matched
            ],
        },
    }


@router.post("/sessions/{session_id}/messages")
async def send_message(
    session_id: uuid.UUID,
    payload: SourcingMessageCreate,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    engine = _get_engine(request)
    response = await sourcing_service.send_message(
        db=db,
        engine=engine,
        session_id=session_id,
        content=payload.content,
    )
    comp_data = None
    if response.components:
        comp_data = [
            {"name": c.name, "explanation": c.explanation}
            for c in response.components
        ]
    return {
        "success": True,
        "data": {
            "content": response.content,
            "components": comp_data,
            "iterations": response.iterations,
        },
    }


@router.post("/sessions/{session_id}/upload")
async def upload_bom(
    session_id: uuid.UUID,
    file: UploadFile = File(...),
    request: Request = None,
    db: AsyncSession = Depends(get_db),
):
    content_bytes = await file.read()

    from app.utils.file_parser import validate_file
    is_valid, error = validate_file(file.content_type, len(content_bytes))
    if not is_valid:
        return {"success": False, "error": {"code": "INVALID_FILE", "message": error}}

    try:
        bom_text = content_bytes.decode("utf-8")
    except UnicodeDecodeError:
        bom_text = content_bytes.decode("latin-1", errors="replace")

    engine = _get_engine(request)
    prompt = (
        f"The user has uploaded a BOM file ({file.filename}). "
        f"Please analyze it using the bom_analysis tool. Here is the file content:\n\n{bom_text[:8000]}"
    )
    response = await sourcing_service.send_message(
        db=db,
        engine=engine,
        session_id=session_id,
        content=prompt,
    )
    comp_data = None
    if response.components:
        comp_data = [
            {"name": c.name, "explanation": c.explanation}
            for c in response.components
        ]
    return {
        "success": True,
        "data": {
            "content": response.content,
            "components": comp_data,
            "iterations": response.iterations,
        },
    }


@router.post("/sessions/{session_id}/rfq")
async def create_rfq(
    session_id: uuid.UUID,
    payload: RFQCreate,
    db: AsyncSession = Depends(get_db),
):
    rfq = await sourcing_service.generate_rfq(
        db=db,
        session_id=session_id,
        product=payload.product,
        quantity=payload.quantity,
        specifications=payload.specifications,
        deadline=payload.deadline,
        supplier_ids=payload.supplier_ids,
        terms=payload.terms,
    )
    if not rfq:
        return {"success": False, "error": {"code": "NOT_FOUND", "message": "Session not found"}}
    return {"success": True, "data": RFQOut.model_validate(rfq)}


@router.get("/sessions/{session_id}/rfq/{rfq_id}")
async def get_rfq(
    session_id: uuid.UUID,
    rfq_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    rfq = await sourcing_service.get_rfq(db, rfq_id)
    if not rfq:
        return {"success": False, "error": {"code": "NOT_FOUND", "message": "RFQ not found"}}
    return {"success": True, "data": RFQOut.model_validate(rfq)}


@router.get("/sessions/{session_id}/suppliers")
async def get_matched_suppliers(
    session_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    suppliers = await sourcing_service.get_matched_suppliers(db, session_id)
    return {
        "success": True,
        "data": [
            {"id": s.id, "name": s.name, "location": s.location,
             "match_score": s.match_score, "stars": s.stars,
             "lead_days": s.lead_days, "lead_label": s.lead_label,
             "price_low": s.price_low, "price_high": s.price_high,
             "price_label": s.price_label, "components": s.components}
            for s in suppliers
        ],
    }
