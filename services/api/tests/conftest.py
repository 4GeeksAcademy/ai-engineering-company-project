"""Pytest fixtures. Env and TestClient come from helpers (imported first)."""

from __future__ import annotations

from collections.abc import Iterator

import pytest

from tests.helpers import reset_auth_db


@pytest.fixture(autouse=True)
def _isolated_auth_db() -> Iterator[None]:
    reset_auth_db()
    yield
