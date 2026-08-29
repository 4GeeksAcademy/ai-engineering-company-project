"""Supplier directory error-shape tests."""

from __future__ import annotations

import unittest
from unittest.mock import patch

from tinydb import TinyDB
from tinydb.storages import MemoryStorage

from tests.helpers import auth_header, client, reset_auth_db


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


if __name__ == "__main__":
    unittest.main()
