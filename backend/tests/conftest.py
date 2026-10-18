import os
import sys
import tempfile

import pytest

# Use a throwaway database and known secrets before the app is imported
_db_dir = tempfile.mkdtemp()
os.environ["DATABASE_URL"] = f"sqlite:///{os.path.join(_db_dir, 'test.db')}"
os.environ["SECRET_KEY"] = "test-secret-key"
os.environ["ADMIN_USERNAME"] = "admin"
os.environ["ADMIN_PASSWORD"] = "AdminPass123"

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi.testclient import TestClient  # noqa: E402
from main import app  # noqa: E402


@pytest.fixture(scope="session")
def client():
    return TestClient(app)


_next_id = [10000000]


@pytest.fixture
def new_voter(client):
    """Register a fresh Nairobi voter and return (national_id, password)"""
    _next_id[0] += 1
    national_id = str(_next_id[0])
    password = "Password123"
    response = client.post("/api/register", json={
        "firstName": "Jane",
        "lastName": "Wanjiku",
        "nationalId": national_id,
        "dateOfBirth": "1995-04-12",
        "phoneNumber": "0712345678",
        "email": "jane@example.com",
        "gender": "female",
        "address": "",
        "county": "Nairobi",
        "constituency": "Westlands",
        "ward": "Parklands",
        "pollingStation": "Parklands Primary",
        "password": password,
    })
    assert response.status_code == 201, response.text
    return national_id, password


def login(client, national_id, password):
    response = client.post("/api/login", json={"nationalId": national_id, "password": password})
    assert response.status_code == 200, response.text
    return {"Authorization": f"Bearer {response.json()['access_token']}"}


def admin_login(client):
    response = client.post("/api/admin/login", json={"username": "admin", "password": "AdminPass123"})
    assert response.status_code == 200, response.text
    return {"Authorization": f"Bearer {response.json()['access_token']}"}
