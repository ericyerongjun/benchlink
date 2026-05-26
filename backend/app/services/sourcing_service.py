"""Sourcing service — bridges API routes to the agent engine and database."""
import uuid
import logging
from datetime import date

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.agent.engine import AgentEngine
from app.agent.schemas import AgentContext, AgentResponse
from app.agent.prompts.templates import RFQ_ENGLISH_SECTION, RFQ_CHINESE_SECTION
from app.models.sourcing_request import SourcingSession, SourcingMessage
from app.models.supplier import Supplier
from app.models.rfq import RFQ
from app.models.activity import Activity

logger = logging.getLogger(__name__)


async def create_session(
    db: AsyncSession,
    title: str | None = None,
) -> SourcingSession:
    s = SourcingSession(title=title or f"Sourcing Session {date.today().isoformat()}")
    db.add(s)
    await db.commit()
    await db.refresh(s)
    return s


async def get_session(
    db: AsyncSession,
    session_id: uuid.UUID,
) -> SourcingSession | None:
    result = await db.execute(
        select(SourcingSession).where(SourcingSession.id == session_id)
    )
    return result.scalar_one_or_none()


async def get_messages(
    db: AsyncSession,
    session_id: uuid.UUID,
) -> list[SourcingMessage]:
    result = await db.execute(
        select(SourcingMessage)
        .where(SourcingMessage.session_id == session_id)
        .order_by(SourcingMessage.created_at)
    )
    return list(result.scalars().all())


async def send_message(
    db: AsyncSession,
    engine: AgentEngine,
    session_id: uuid.UUID,
    content: str,
) -> AgentResponse:
    existing = await get_messages(db, session_id)

    # Build history in OpenAI format
    history = []
    for m in existing:
        history.append({"role": m.role, "content": m.content})

    # Save user message
    user_msg = SourcingMessage(
        session_id=session_id,
        role="user",
        content=content,
    )
    db.add(user_msg)

    # Run agent
    response = await engine.run(
        session_id=str(session_id),
        user_input=content,
        history=history,
    )

    # Save assistant message
    assistant_msg = SourcingMessage(
        session_id=session_id,
        role="assistant",
        content=response.content,
        msg_metadata={"iterations": response.iterations},
    )
    db.add(assistant_msg)

    # Update session with detected components
    sourcing_session = await get_session(db, session_id)
    if sourcing_session:
        if response.components:
            new_names = [c.name for c in response.components]
            existing_names = sourcing_session.detected_components or []
            normalized_existing = {n.lower().strip() for n in existing_names}
            merged = list(existing_names)
            for name in new_names:
                if name.lower().strip() not in normalized_existing:
                    merged.append(name)
                    normalized_existing.add(name.lower().strip())
            sourcing_session.detected_components = merged
        sourcing_session.updated_at = func.now()  # trigger onupdate

    # Log activity
    comp_count = len(response.components) if response.components else 0
    activity = Activity(
        tag="Sourcing",
        text=f"Agent response generated — {comp_count} components identified in {response.iterations} iterations",
        time_label="Just now",
    )
    db.add(activity)

    await db.commit()
    return response


async def generate_rfq(
    db: AsyncSession,
    session_id: uuid.UUID,
    product: str,
    quantity: int,
    specifications: str,
    deadline: str,
    supplier_ids: list[int],
    terms: str = "Net 30 · FOB Shenzhen",
) -> RFQ | None:
    sourcing_session = await get_session(db, session_id)
    if not sourcing_session:
        return None

    result_s = await db.execute(select(Supplier).where(Supplier.id.in_(supplier_ids)))
    suppliers = result_s.scalars().all()

    rfq_number = f"RFQ-{date.today().strftime('%Y')}-{uuid.uuid4().hex[:4].upper()}"
    today_str = date.today().strftime("%B %d, %Y")

    supplier_list_en = "\n".join(f"  - {s.name} ({s.location})" for s in suppliers)
    supplier_list_zh = "\n".join(f"  - {s.name}（{s.location}）" for s in suppliers)

    english_content = {
        "rfq_number": rfq_number, "product": product,
        "quantity": quantity, "specifications": specifications,
        "deadline": deadline, "terms": terms,
        "suppliers": [{"id": s.id, "name": s.name, "location": s.location} for s in suppliers],
        "body": RFQ_ENGLISH_SECTION.format(
            rfq_number=rfq_number, date=today_str, product=product,
            quantity=quantity, specifications=specifications,
            deadline=deadline, terms=terms, supplier_list=supplier_list_en,
        ),
    }
    chinese_content = {
        "rfq_number": rfq_number, "product": product,
        "quantity": quantity, "specifications": specifications,
        "deadline": deadline, "terms": terms,
        "body": RFQ_CHINESE_SECTION.format(
            rfq_number=rfq_number, date=today_str, product=product,
            quantity=quantity, specifications=specifications,
            deadline=deadline, terms=terms, supplier_list=supplier_list_zh,
        ),
    }

    rfq_result = {
        "success": True, "rfq_number": rfq_number,
        "product": product, "quantity": quantity,
        "specifications": specifications, "deadline": deadline, "terms": terms,
        "supplier_ids": supplier_ids,
        "english_content": english_content, "chinese_content": chinese_content,
    }

    rfq = RFQ(
        session_id=session_id,
        rfq_number=rfq_result["rfq_number"],
        product=product,
        quantity=quantity,
        specifications=specifications,
        deadline=deadline,
        terms=terms,
        supplier_ids=supplier_ids,
        english_content=rfq_result["english_content"],
        chinese_content=rfq_result["chinese_content"],
    )
    db.add(rfq)

    activity = Activity(
        tag="Sourcing",
        text=f"RFQ {rfq_result['rfq_number']} generated for {len(supplier_ids)} suppliers",
        time_label="Just now",
    )
    db.add(activity)

    await db.commit()
    await db.refresh(rfq)
    return rfq


async def get_rfq(
    db: AsyncSession,
    rfq_id: uuid.UUID,
) -> RFQ | None:
    result = await db.execute(select(RFQ).where(RFQ.id == rfq_id))
    return result.scalar_one_or_none()


async def get_matched_suppliers(
    db: AsyncSession,
    session_id: uuid.UUID,
) -> list[Supplier]:
    sourcing_session = await get_session(db, session_id)
    if not sourcing_session or not sourcing_session.matched_supplier_ids:
        return []
    result = await db.execute(
        select(Supplier).where(Supplier.id.in_(sourcing_session.matched_supplier_ids))
    )
    return list(result.scalars().all())


async def get_accumulated_components(db: AsyncSession) -> list[str]:
    """Return all unique component names ever detected across all sessions."""
    result = await db.execute(
        select(SourcingSession.detected_components)
        .where(SourcingSession.detected_components.isnot(None))
    )
    lower_seen = set()
    unique = []
    for row in result.scalars().all():
        if row:
            for name in row:
                n = name.strip()
                nl = n.lower()
                if nl not in lower_seen:
                    lower_seen.add(nl)
                    unique.append(n)
    return unique
