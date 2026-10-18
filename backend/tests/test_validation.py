from datetime import date

import pytest

VALID = {
    "firstName": "John",
    "lastName": "Otieno",
    "nationalId": "23456789",
    "dateOfBirth": "1990-01-01",
    "phoneNumber": "+254712345678",
    "email": "john@example.com",
    "gender": "male",
    "address": "",
    "county": "Kisumu",
    "constituency": "Kisumu Central",
    "ward": "Market Milimani",
    "pollingStation": "Kisumu Day",
    "password": "Password123",
}


def register(client, **overrides):
    return client.post("/api/register", json={**VALID, **overrides})


def test_valid_registration_and_duplicate_id(client):
    assert register(client, nationalId="34567890").status_code == 201
    response = register(client, nationalId="34567890")
    assert response.status_code == 400
    assert response.json()["detail"] == "National ID already registered"


@pytest.mark.parametrize("field,value", [
    ("nationalId", "12ab"),
    ("nationalId", "123456789"),
    ("phoneNumber", "12345"),
    ("email", "not-an-email"),
    ("gender", "robot"),
    ("county", "Atlantis"),
    ("password", "short1"),
    ("password", "onlyletters"),
    ("firstName", "J0hn"),
    ("constituency", "   "),
    ("dateOfBirth", "not-a-date"),
])
def test_invalid_fields_are_rejected(client, field, value):
    assert register(client, **{"nationalId": "45678901", field: value}).status_code == 422


def test_under_18_is_rejected(client):
    today = date.today()
    seventeen = date(today.year - 17, today.month, 1).isoformat()
    response = register(client, nationalId="56789012", dateOfBirth=seventeen)
    assert response.status_code == 422
    assert "18" in response.text


def test_future_birth_date_is_rejected(client):
    response = register(client, nationalId="67890123", dateOfBirth=f"{date.today().year + 1}-01-01")
    assert response.status_code == 422


def test_verify_with_non_numeric_year_returns_422_not_500(client):
    response = client.post("/api/verify", json={"idNumber": "23456789", "yearOfBirth": "abcd"})
    assert response.status_code == 422


def test_verify_does_not_reveal_whether_id_exists(client):
    register(client, nationalId="78901234")
    wrong_year = client.post("/api/verify", json={"idNumber": "78901234", "yearOfBirth": 1950})
    unknown_id = client.post("/api/verify", json={"idNumber": "11111111", "yearOfBirth": 1990})
    assert wrong_year.status_code == unknown_id.status_code == 404
    assert wrong_year.json() == unknown_id.json()
