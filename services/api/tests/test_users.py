"""GET/PUT/DELETE /users and GET /users/{id}."""

from __future__ import annotations

from tests.helpers import admin_header, auth_header, client, login, register
from app.auth.service import get_user_by_email


def test_list_users_includes_authenticated_user() -> None:
    headers = auth_header()
    response = client.get("/users", headers=headers)
    assert response.status_code == 200
    emails = [row["email"] for row in response.json()]
    assert "alice@healthcore.example" in emails


def test_list_users_contains_only_users_created_in_this_test() -> None:
    headers = auth_header(email="only@healthcore.example")
    response = client.get("/users", headers=headers)
    assert response.status_code == 200
    assert len(response.json()) == 1
    assert response.json()[0]["email"] == "only@healthcore.example"


def test_list_users_requires_token() -> None:
    assert client.get("/users").status_code == 401


def test_get_user_self() -> None:
    headers = auth_header()
    user = get_user_by_email("alice@healthcore.example")
    response = client.get(f"/users/{user['id']}", headers=headers)
    assert response.status_code == 200
    assert response.json()["email"] == "alice@healthcore.example"
    assert "hashed_password" not in response.json()


def test_admin_can_read_another_user() -> None:
    register(email="staff@healthcore.example")
    staff = get_user_by_email("staff@healthcore.example")
    headers = admin_header()
    response = client.get(f"/users/{staff['id']}", headers=headers)
    assert response.status_code == 200
    assert response.json()["email"] == "staff@healthcore.example"


def test_get_user_forbidden_for_other_non_admin() -> None:
    headers_a = auth_header(email="a@healthcore.example")
    register(email="b@healthcore.example")
    user_b = get_user_by_email("b@healthcore.example")
    response = client.get(f"/users/{user_b['id']}", headers=headers_a)
    assert response.status_code == 403


def test_get_unknown_user_returns_404() -> None:
    headers = auth_header()
    assert client.get("/users/99999", headers=headers).status_code == 404


def test_user_can_update_own_email_and_password() -> None:
    headers = auth_header()
    user = get_user_by_email("alice@healthcore.example")
    response = client.put(
        f"/users/{user['id']}",
        headers=headers,
        json={"email": "alice2@healthcore.example", "password": "newpass1"},
    )
    assert response.status_code == 200
    assert response.json()["email"] == "alice2@healthcore.example"
    assert login(email="alice2@healthcore.example", password="newpass1").status_code == 200
    stored = get_user_by_email("alice2@healthcore.example")
    assert stored is not None
    assert stored["hashed_password"] != "newpass1"
    assert str(stored["hashed_password"]).startswith("$2")


def test_update_duplicate_email_returns_409() -> None:
    auth_header(email="first@healthcore.example")
    headers = auth_header(email="second@healthcore.example")
    second = get_user_by_email("second@healthcore.example")
    response = client.put(
        f"/users/{second['id']}",
        headers=headers,
        json={"email": "first@healthcore.example"},
    )
    assert response.status_code == 409


def test_admin_can_update_role() -> None:
    register(email="staff@healthcore.example")
    staff = get_user_by_email("staff@healthcore.example")
    headers = admin_header()
    response = client.put(
        f"/users/{staff['id']}",
        headers=headers,
        json={"role": "manager"},
    )
    assert response.status_code == 200
    assert response.json()["role"] == "manager"


def test_non_admin_cannot_set_is_active() -> None:
    headers = auth_header()
    uid = client.get("/users", headers=headers).json()[0]["id"]
    response = client.put(
        f"/users/{uid}",
        headers=headers,
        json={"is_active": False},
    )
    assert response.status_code == 403


def test_invalid_role_rejected_on_update_without_admin() -> None:
    headers = auth_header()
    uid = client.get("/users", headers=headers).json()[0]["id"]
    response = client.put(
        f"/users/{uid}",
        headers=headers,
        json={"role": "superuser"},
    )
    assert response.status_code == 422
    forbidden = client.put(
        f"/users/{uid}",
        headers=headers,
        json={"role": "admin"},
    )
    assert forbidden.status_code == 403


def test_cross_user_update_forbidden() -> None:
    headers_a = auth_header(email="a@healthcore.example")
    register(email="b@healthcore.example", password="secret123")
    user_b = get_user_by_email("b@healthcore.example")
    response = client.put(
        f"/users/{user_b['id']}",
        headers=headers_a,
        json={"email": "stolen@healthcore.example"},
    )
    assert response.status_code == 403


def test_self_delete_then_login_fails() -> None:
    headers = auth_header(email="gone@healthcore.example")
    user = get_user_by_email("gone@healthcore.example")
    response = client.delete(f"/users/{user['id']}", headers=headers)
    assert response.status_code == 204
    assert login(email="gone@healthcore.example", password="secret123").status_code == 401


def test_admin_can_delete_another_user() -> None:
    register(email="staff@healthcore.example")
    staff = get_user_by_email("staff@healthcore.example")
    headers = admin_header()
    response = client.delete(f"/users/{staff['id']}", headers=headers)
    assert response.status_code == 204
    assert get_user_by_email("staff@healthcore.example") is None


def test_cross_user_delete_forbidden() -> None:
    headers_a = auth_header(email="a@healthcore.example")
    register(email="b@healthcore.example")
    user_b = get_user_by_email("b@healthcore.example")
    response = client.delete(f"/users/{user_b['id']}", headers=headers_a)
    assert response.status_code == 403


def test_admin_delete_unknown_user_returns_404() -> None:
    headers = admin_header()
    assert client.delete("/users/99999", headers=headers).status_code == 404
