"""GET/PUT /profiles/me."""

from __future__ import annotations

from tests.helpers import auth_header, client, login, register


def test_get_own_profile_matches_register() -> None:
    register(name="Alice", phone="555", address="1 Clinic Rd")
    token = login().json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    response = client.get("/profiles/me", headers=headers)
    assert response.status_code == 200
    body = response.json()
    assert body["name"] == "Alice"
    assert body["phone"] == "555"
    assert body["address"] == "1 Clinic Rd"


def test_get_profile_omitted_fields_are_null() -> None:
    headers = auth_header(email="sparse@healthcore.example")
    response = client.get("/profiles/me", headers=headers)
    assert response.status_code == 200
    body = response.json()
    assert body["name"] is None
    assert body["phone"] is None
    assert body["address"] is None


def test_get_profile_requires_token() -> None:
    assert client.get("/profiles/me").status_code == 401


def test_update_own_profile() -> None:
    headers = auth_header(email="a@healthcore.example")
    profile = client.put(
        "/profiles/me",
        headers=headers,
        json={"name": "Alice A"},
    )
    assert profile.status_code == 200
    assert profile.json()["name"] == "Alice A"


def test_partial_profile_update_leaves_other_fields() -> None:
    register(email="partial@healthcore.example", name="Keep Me", phone="555")
    token = login(email="partial@healthcore.example").json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    response = client.put(
        "/profiles/me",
        headers=headers,
        json={"address": "2 Clinic Rd"},
    )
    assert response.status_code == 200
    body = response.json()
    assert body["name"] == "Keep Me"
    assert body["phone"] == "555"
    assert body["address"] == "2 Clinic Rd"


def test_update_profile_requires_token() -> None:
    assert client.put("/profiles/me", json={"name": "X"}).status_code == 401
