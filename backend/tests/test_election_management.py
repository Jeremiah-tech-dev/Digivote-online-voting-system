from conftest import admin_login, login
from test_security import VALID_BALLOT

NEW_CANDIDATE = {
    "first_name": "Grace",
    "last_name": "Akinyi",
    "party": "Independent",
    "position": "Governor",
    "county": "Kisumu",
    "image_url": "https://example.com/grace.jpg",
    "party_logo_url": "",
}


# --- Candidates come from the API ----------------------------------------

def test_candidates_are_public_with_images(client):
    candidates = client.get("/api/elections/1/candidates").json()["candidates"]
    assert len(candidates) == 26
    ruto = next(c for c in candidates if c["last_name"] == "Ruto")
    assert ruto["image_url"].startswith("https://")
    assert ruto["county"] is None


# --- Ballot secrecy and receipts -----------------------------------------

def test_ballot_returns_receipt_that_can_be_checked(client, new_voter):
    headers = login(client, *new_voter)
    receipt = client.post("/api/votes", json=VALID_BALLOT, headers=headers).json()["receipt_code"]
    assert len(receipt) == 14  # XXXX-XXXX-XXXX

    check = client.get(f"/api/receipts/{receipt.lower()}")
    assert check.status_code == 200
    assert check.json()["positions_recorded"] == ["Governor", "Presidential", "Senator"]


def test_receipt_does_not_reveal_choices(client, new_voter):
    headers = login(client, *new_voter)
    receipt = client.post("/api/votes", json=VALID_BALLOT, headers=headers).json()["receipt_code"]
    body = client.get(f"/api/receipts/{receipt}").text
    assert "Ruto" not in body and "candidate" not in body


def test_unknown_receipt_is_404(client):
    assert client.get("/api/receipts/AAAA-BBBB-CCCC").status_code == 404


def test_votes_table_has_no_link_to_voters():
    """The core of ballot secrecy: a vote row holds no voter ID and no timestamp"""
    from app.models.vote import Vote
    columns = set(Vote.__table__.columns.keys())
    assert "voter_id" not in columns
    assert "voted_at" not in columns


# --- Election control ----------------------------------------------------

def test_voting_blocked_when_election_not_active(client, new_voter, empty_election):
    headers = login(client, *new_voter)
    ballot = {**VALID_BALLOT, "election_id": empty_election}
    response = client.post("/api/votes", json=ballot, headers=headers)
    assert response.status_code == 403


def test_election_lifecycle(client, empty_election):
    admin = admin_login(client)
    url = f"/api/admin/elections/{empty_election}/status"
    assert client.put(url, json={"status": "active"}, headers=admin).status_code == 200
    assert client.put(url, json={"status": "closed"}, headers=admin).status_code == 200
    # Closed is final
    response = client.put(url, json={"status": "active"}, headers=admin)
    assert response.status_code == 400


def test_cannot_skip_straight_from_upcoming_to_closed(client, empty_election):
    response = client.put(f"/api/admin/elections/{empty_election}/status",
                          json={"status": "closed"}, headers=admin_login(client))
    assert response.status_code == 400


def test_cannot_reset_election_after_votes(client, new_voter):
    client.post("/api/votes", json=VALID_BALLOT, headers=login(client, *new_voter))
    response = client.put("/api/admin/elections/1/status", json={"status": "upcoming"},
                          headers=admin_login(client))
    assert response.status_code == 400


def test_voter_cannot_change_election_status(client, new_voter, empty_election):
    response = client.put(f"/api/admin/elections/{empty_election}/status",
                          json={"status": "active"}, headers=login(client, *new_voter))
    assert response.status_code == 403


def test_invalid_status_is_rejected(client, empty_election):
    response = client.put(f"/api/admin/elections/{empty_election}/status",
                          json={"status": "paused"}, headers=admin_login(client))
    assert response.status_code == 422


# --- Candidate management ------------------------------------------------

def test_admin_can_add_edit_and_delete_candidate(client, empty_election):
    admin = admin_login(client)
    created = client.post(f"/api/admin/elections/{empty_election}/candidates",
                          json=NEW_CANDIDATE, headers=admin)
    assert created.status_code == 201
    candidate = created.json()
    assert candidate["party_logo_url"] is None  # blank becomes null

    updated = client.put(f"/api/admin/candidates/{candidate['id']}",
                         json={**NEW_CANDIDATE, "party": "ODM"}, headers=admin)
    assert updated.json()["party"] == "ODM"

    assert client.delete(f"/api/admin/candidates/{candidate['id']}", headers=admin).status_code == 200
    candidates = client.get(f"/api/elections/{empty_election}/candidates").json()["candidates"]
    assert candidates == []


def test_candidate_validation(client, empty_election):
    admin = admin_login(client)
    url = f"/api/admin/elections/{empty_election}/candidates"
    assert client.post(url, json={**NEW_CANDIDATE, "position": "Mayor"}, headers=admin).status_code == 422
    assert client.post(url, json={**NEW_CANDIDATE, "county": None}, headers=admin).status_code == 422
    assert client.post(url, json={**NEW_CANDIDATE, "image_url": "javascript:alert(1)"}, headers=admin).status_code == 422


def test_presidential_candidate_has_no_county(client, empty_election):
    response = client.post(f"/api/admin/elections/{empty_election}/candidates",
                           json={**NEW_CANDIDATE, "position": "Presidential"}, headers=admin_login(client))
    assert response.status_code == 201
    assert response.json()["county"] is None


def test_candidates_locked_once_votes_cast(client, new_voter):
    client.post("/api/votes", json=VALID_BALLOT, headers=login(client, *new_voter))
    admin = admin_login(client)
    assert client.delete("/api/admin/candidates/1", headers=admin).status_code == 400
    assert client.post("/api/admin/elections/1/candidates", json=NEW_CANDIDATE, headers=admin).status_code == 400


def test_voter_cannot_manage_candidates(client, new_voter, empty_election):
    response = client.post(f"/api/admin/elections/{empty_election}/candidates",
                           json=NEW_CANDIDATE, headers=login(client, *new_voter))
    assert response.status_code == 403


# --- Results and audit log -----------------------------------------------

def test_results_include_turnout(client, new_voter):
    client.post("/api/votes", json=VALID_BALLOT, headers=login(client, *new_voter))
    data = client.get("/api/results", headers=admin_login(client)).json()
    summary = data["summary"]
    assert summary["ballots_cast"] >= 1
    assert 0 < summary["turnout_percent"] <= 100
    nairobi = next(c for c in data["turnout_by_county"] if c["county"] == "Nairobi")
    assert nairobi["voted"] >= 1
    timeline = data["turnout_timeline"]
    assert timeline[-1]["cumulative"] == summary["ballots_cast"]


def test_audit_log_records_ballot_without_choices(client, new_voter):
    client.post("/api/votes", json=VALID_BALLOT, headers=login(client, *new_voter))
    entries = client.get("/api/admin/audit-log", headers=admin_login(client)).json()["entries"]
    ballot_entry = next(e for e in entries if e["action"] == "ballot_cast" and e["actor"] == new_voter[0])
    assert "Ruto" not in str(ballot_entry) and "candidate" not in str(ballot_entry)


def test_failed_admin_login_is_audited(client):
    client.post("/api/admin/login", json={"username": "intruder", "password": "guess123"})
    entries = client.get("/api/admin/audit-log", headers=admin_login(client)).json()["entries"]
    assert any(e["action"] == "admin_login_failed" and e["actor"] == "intruder" for e in entries)


def test_audit_log_requires_admin(client):
    assert client.get("/api/admin/audit-log").status_code == 401


# --- Demo mode -------------------------------------------------------------

def test_demo_data_fills_an_empty_database(monkeypatch, tmp_path):
    """Demo mode creates voters and ballots that add up, without linking votes to voters"""
    from sqlalchemy import create_engine
    from sqlalchemy.orm import sessionmaker
    from app import config
    from app.database import Base
    from app.models.vote import Vote, VoterParticipation
    from app.models.voter import Voter
    from app.models.election import Election
    from app.seed import seed_database

    engine = create_engine(f"sqlite:///{tmp_path / 'demo.db'}")
    Base.metadata.create_all(bind=engine)
    monkeypatch.setattr(config, "DEMO_DATA", True)

    with sessionmaker(bind=engine)() as db:
        seed_database(db)
        voters = db.query(Voter).count()
        ballots = db.query(VoterParticipation).count()
        assert voters > 0 and 0 < ballots < voters
        assert db.query(Vote).count() == ballots * 3
        assert db.query(Election).get(1).status == "active"

        seed_database(db)  # running again must not add more
        assert db.query(Voter).count() == voters
