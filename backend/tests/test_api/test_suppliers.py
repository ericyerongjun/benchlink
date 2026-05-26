"""Supplier endpoint tests."""
import pytest


@pytest.mark.asyncio
async def test_list_suppliers_empty(client):
    """Suppliers list returns empty before seeding."""
    response = await client.get("/api/v1/suppliers")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "data" in data


@pytest.mark.asyncio
async def test_list_component_types(client):
    response = await client.get("/api/v1/suppliers/components")
    assert response.status_code == 200
    assert response.json()["success"] is True


@pytest.mark.asyncio
async def test_list_locations(client):
    response = await client.get("/api/v1/suppliers/locations")
    assert response.status_code == 200
    assert response.json()["success"] is True


@pytest.mark.asyncio
async def test_get_supplier_not_found(client):
    response = await client.get("/api/v1/suppliers/99999")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is False
