import os
import sys
import tempfile

import pytest

# Use a throwaway database and known secrets before the app is imported.
# Set TEST_DATABASE_URL to run the tests against PostgreSQL (it must start empty).
_db_dir = tempfile.mkdtemp()
os.environ["DATABASE_URL"] = os.getenv("TEST_DATABASE_URL", f"sqlite:///{os.path.join(_db_dir, 'test.db')}")
os.environ.pop("DEMO_DATA", None)
os.environ["SECRET_KEY"] = "test-secret-key"
os.environ["ADMIN_USERNAME"] = "admin"
os.environ["ADMIN_PASSWORD"] = "AdminPass123"

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi.testclient import TestClient  # noqa: E402
from main import app  # noqa: E402


@pytest.fixture(scope="session")
def client():
    test_client = TestClient(app)
    # The seeded election starts as 'upcoming'; open it so tests can vote
    response = test_client.put("/api/admin/elections/1/status", json={"status": "active"},
                               headers=admin_login(test_client))
    assert response.status_code == 200, response.text
    return test_client


@pytest.fixture
def empty_election():
    """A separate election with no candidates or votes, for tests that change its status"""
    from datetime import datetime
    from app.database import SessionLocal
    from app.models.election import Election

    with SessionLocal() as db:
        election = Election(title="Test By-Election", election_type="By-Election",
                            start_date=datetime(2027, 1, 1), end_date=datetime(2027, 1, 1),
                            status="upcoming")
        db.add(election)
        db.commit()
        return election.id


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
