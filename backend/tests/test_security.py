from conftest import admin_login, login

# Nairobi candidates from the seed data
PRESIDENT = 1
NAIROBI_GOVERNOR = 5
NAIROBI_SENATOR = 7
MOMBASA_GOVERNOR = 9

VALID_BALLOT = {
    "presidential_id": PRESIDENT,
    "governor_id": NAIROBI_GOVERNOR,
    "senator_id": NAIROBI_SENATOR,
}


# --- Authentication -------------------------------------------------------

def test_login_returns_token(client, new_voter):
    response = client.post("/api/login", json={"nationalId": new_voter[0], "password": new_voter[1]})
    assert response.status_code == 200
    assert response.json()["access_token"]
    assert "password_hash" not in response.json()["voter"]


def test_login_with_wrong_password_fails(client, new_voter):
    response = client.post("/api/login", json={"nationalId": new_voter[0], "password": "WrongPass1"})
    assert response.status_code == 401


def test_me_requires_token(client):
    assert client.get("/api/me").status_code == 401


def test_forged_token_is_rejected(client):
    response = client.get("/api/me", headers={"Authorization": "Bearer not-a-real-token"})
    assert response.status_code == 401


# --- Voting rules ---------------------------------------------------------

def test_cannot_vote_without_logging_in(client):
    assert client.post("/api/votes", json=VALID_BALLOT).status_code == 401


def test_voter_can_cast_one_ballot(client, new_voter):
    headers = login(client, *new_voter)
    response = client.post("/api/votes", json=VALID_BALLOT, headers=headers)
    assert response.status_code == 201
    assert client.get("/api/me", headers=headers).json()["has_voted"] is True


def test_cannot_vote_twice(client, new_voter):
    headers = login(client, *new_voter)
    assert client.post("/api/votes", json=VALID_BALLOT, headers=headers).status_code == 201
    assert client.post("/api/votes", json=VALID_BALLOT, headers=headers).status_code == 409


def test_cannot_log_in_after_voting(client, new_voter):
    headers = login(client, *new_voter)
    client.post("/api/votes", json=VALID_BALLOT, headers=headers)
    response = client.post("/api/login", json={"nationalId": new_voter[0], "password": new_voter[1]})
    assert response.status_code == 403


def test_cannot_vote_for_governor_outside_own_county(client, new_voter):
    headers = login(client, *new_voter)
    ballot = {**VALID_BALLOT, "governor_id": MOMBASA_GOVERNOR}
    response = client.post("/api/votes", json=ballot, headers=headers)
    assert response.status_code == 400
    # A rejected ballot must not use up the voter's vote
    assert client.get("/api/me", headers=headers).json()["has_voted"] is False


def test_cannot_put_candidate_in_wrong_position(client, new_voter):
    headers = login(client, *new_voter)
    ballot = {**VALID_BALLOT, "presidential_id": NAIROBI_GOVERNOR}
    assert client.post("/api/votes", json=ballot, headers=headers).status_code == 400


def test_voter_id_in_body_is_ignored(client, new_voter):
    """The voter always comes from the token, so nobody can vote on someone else's behalf"""
    headers = login(client, *new_voter)
    ballot = {**VALID_BALLOT, "voter_id": 1}
    assert client.post("/api/votes", json=ballot, headers=headers).status_code == 201
    assert client.get("/api/me", headers=headers).json()["has_voted"] is True


def test_mark_voted_endpoint_is_gone(client):
    assert client.put("/api/voters/1/mark-voted").status_code in (404, 405)


# --- Admin access ---------------------------------------------------------

def test_results_require_admin(client):
    assert client.get("/api/results").status_code == 401


def test_voter_token_cannot_read_results(client, new_voter):
    headers = login(client, *new_voter)
    assert client.get("/api/results", headers=headers).status_code == 403


def test_admin_can_read_results(client, new_voter):
    headers = login(client, *new_voter)
    client.post("/api/votes", json=VALID_BALLOT, headers=headers)
    response = client.get("/api/results", headers=admin_login(client))
    assert response.status_code == 200
    president = next(r for r in response.json()["results"] if r["candidate_name"] == "William Samoei Ruto")
    assert president["vote_count"] >= 1


def test_admin_wrong_password_fails(client):
    response = client.post("/api/admin/login", json={"username": "admin", "password": "admin2025"})
    assert response.status_code == 401


def test_voter_list_requires_admin(client):
    assert client.get("/api/voters").status_code == 401


def test_public_stats_are_aggregate_only(client):
    data = client.get("/api/stats").json()
    assert set(data) == {"total_voters", "voters_voted"}
