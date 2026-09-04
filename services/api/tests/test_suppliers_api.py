"""Supplier directory endpoint tests."""

from __future__ import annotations

import unittest
from unittest.mock import patch

from tinydb import TinyDB
from tinydb.storages import MemoryStorage

from tests.helpers import auth_header, client, reset_auth_db

USA_LAB = {
    "name": "Alpha Lab",
    "country": "USA",
    "categories": ["laboratory_services"],
    "monthly_rate": 10.0,
    "currency": "USD",
    "status": "active",
}

UK_PHARMA = {
    "name": "Zeta Pharma",
    "country": "UK",
    "categories": ["pharmaceutical"],
    "monthly_rate": 20.0,
    "currency": "GBP",
    "status": "suspended",
}


class SupplierApiTest(unittest.TestCase):
    def setUp(self) -> None:
        reset_auth_db()
        self.db = TinyDB(storage=MemoryStorage)
        self.table = self.db.table("suppliers")
        self.patcher = patch(
            "app.routers.suppliers.suppliers_table", return_value=self.table
        )
        self.patcher.start()
        self.headers = auth_header()

    def tearDown(self) -> None:
        self.patcher.stop()
        self.db.close()

    def _create(self, payload: dict) -> dict:
        response = client.post("/suppliers", headers=self.headers, json=payload)
        self.assertEqual(response.status_code, 201, response.text)
        return response.json()

    def test_get_missing_supplier_404(self) -> None:
        response = client.get("/suppliers/99999", headers=self.headers)
        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.json()["detail"], "Supplier not found")

    def test_patch_empty_body_400(self) -> None:
        created = client.post(
            "/suppliers",
            headers=self.headers,
            json={
                "name": "Test Lab",
                "country": "USA",
                "categories": ["laboratory_services"],
                "monthly_rate": 10.0,
                "currency": "USD",
                "status": "active",
            },
        )
        self.assertEqual(created.status_code, 201)
        supplier_id = created.json()["id"]
        response = client.patch(
            f"/suppliers/{supplier_id}",
            headers=self.headers,
            json={},
        )
        self.assertEqual(response.status_code, 400)

    def test_create_uk_usd_returns_422_shape(self) -> None:
        response = client.post(
            "/suppliers",
            headers=self.headers,
            json={
                "name": "Bad Currency",
                "country": "UK",
                "categories": ["laboratory_services"],
                "monthly_rate": 10.0,
                "currency": "USD",
                "status": "active",
            },
        )
        self.assertEqual(response.status_code, 422)
        body = response.json()
        self.assertEqual(body["detail"], "Validation failed")
        self.assertIsInstance(body.get("errors"), list)
        self.assertTrue(body["errors"])

    def test_patch_invalid_rate_matches_422_shape(self) -> None:
        created = client.post(
            "/suppliers",
            headers=self.headers,
            json={
                "name": "Rate Lab",
                "country": "USA",
                "categories": ["laboratory_services"],
                "monthly_rate": 10.0,
                "currency": "USD",
                "status": "active",
            },
        )
        self.assertEqual(created.status_code, 201)
        supplier_id = created.json()["id"]
        response = client.patch(
            f"/suppliers/{supplier_id}/rate",
            headers=self.headers,
            json={"monthly_rate": -1},
        )
        self.assertEqual(response.status_code, 422)
        body = response.json()
        self.assertEqual(body["detail"], "Validation failed")
        self.assertIsInstance(body.get("errors"), list)

    def test_create_returns_201_with_stored_fields(self) -> None:
        body = self._create(USA_LAB)
        self.assertIsInstance(body["id"], int)
        self.assertEqual(body["name"], "Alpha Lab")
        self.assertEqual(body["country"], "USA")
        self.assertEqual(body["categories"], ["laboratory_services"])
        self.assertEqual(body["monthly_rate"], 10.0)
        self.assertEqual(body["currency"], "USD")
        self.assertEqual(body["status"], "active")
        self.assertTrue(body["updated_at"])

    def test_get_returns_created_supplier(self) -> None:
        created = self._create(USA_LAB)
        response = client.get(f"/suppliers/{created['id']}", headers=self.headers)
        self.assertEqual(response.status_code, 200)
        body = response.json()
        self.assertEqual(body["id"], created["id"])
        self.assertEqual(body["name"], "Alpha Lab")

    def test_list_includes_created_and_sorts_by_name(self) -> None:
        self._create(UK_PHARMA)
        self._create(USA_LAB)
        response = client.get("/suppliers", headers=self.headers)
        self.assertEqual(response.status_code, 200)
        names = [row["name"] for row in response.json()]
        self.assertEqual(names, ["Alpha Lab", "Zeta Pharma"])

    def test_patch_rate_updates_monthly_rate(self) -> None:
        created = self._create(USA_LAB)
        original_updated = created["updated_at"]
        response = client.patch(
            f"/suppliers/{created['id']}/rate",
            headers=self.headers,
            json={"monthly_rate": 15.5},
        )
        self.assertEqual(response.status_code, 200)
        body = response.json()
        self.assertEqual(body["monthly_rate"], 15.5)
        self.assertGreaterEqual(body["updated_at"], original_updated)

    def test_patch_status_to_suspended(self) -> None:
        created = self._create(USA_LAB)
        response = client.patch(
            f"/suppliers/{created['id']}/status",
            headers=self.headers,
            json={"status": "suspended"},
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["status"], "suspended")
        self.assertEqual(response.json()["monthly_rate"], 10.0)

    def test_list_filters_by_country_category_status(self) -> None:
        self._create(USA_LAB)
        self._create(UK_PHARMA)
        by_country = client.get("/suppliers", headers=self.headers, params={"country": "USA"})
        self.assertEqual([row["name"] for row in by_country.json()], ["Alpha Lab"])
        by_category = client.get(
            "/suppliers", headers=self.headers, params={"category": "pharmaceutical"}
        )
        self.assertEqual([row["name"] for row in by_category.json()], ["Zeta Pharma"])
        by_status = client.get(
            "/suppliers", headers=self.headers, params={"status": "suspended"}
        )
        self.assertEqual([row["name"] for row in by_status.json()], ["Zeta Pharma"])

    def test_list_skips_unreadable_document(self) -> None:
        self.table.insert({"name": "broken-row"})
        self._create(USA_LAB)
        response = client.get("/suppliers", headers=self.headers)
        self.assertEqual(response.status_code, 200)
        names = [row["name"] for row in response.json()]
        self.assertEqual(names, ["Alpha Lab"])
        self.assertNotIn("broken-row", names)

    def test_create_uk_gbp_succeeds(self) -> None:
        body = self._create(UK_PHARMA)
        self.assertEqual(body["country"], "UK")
        self.assertEqual(body["currency"], "GBP")
        self.assertEqual(body["name"], "Zeta Pharma")

    def test_unauthenticated_requests_return_401(self) -> None:
        created = self._create(USA_LAB)
        supplier_id = created["id"]
        self.assertEqual(client.get("/suppliers").status_code, 401)
        self.assertEqual(client.post("/suppliers", json=USA_LAB).status_code, 401)
        self.assertEqual(client.get(f"/suppliers/{supplier_id}").status_code, 401)
        self.assertEqual(
            client.patch(f"/suppliers/{supplier_id}", json={"status": "suspended"}).status_code,
            401,
        )

    def test_patch_unknown_id_returns_404(self) -> None:
        response = client.patch(
            "/suppliers/99999",
            headers=self.headers,
            json={"status": "suspended"},
        )
        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.json()["detail"], "Supplier not found")


if __name__ == "__main__":
    unittest.main()
