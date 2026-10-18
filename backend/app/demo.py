"""Demo data for presentations: sample voters and ballots so the admin
dashboards have something to show. Only runs when DEMO_DATA=true and the
database has no voters yet. Never enable it for a real election."""
import random
import secrets
from datetime import date, datetime, timedelta

from app import config
from app.models.audit_log import AuditLog
from app.models.election import Candidate, Election
from app.models.vote import Vote, VoterParticipation
from app.models.voter import Voter
from app.utils.helpers import generate_receipt_code, hash_password

FIRST_NAMES = [
    'Amina', 'Brian', 'Cynthia', 'David', 'Esther', 'Felix', 'Grace', 'Hassan', 'Irene', 'James',
    'Kevin', 'Lilian', 'Moses', 'Naomi', 'Omondi', 'Purity', 'Rose', 'Samuel', 'Faith', 'Wycliffe'
]
LAST_NAMES = [
    'Otieno', 'Wanjiku', 'Mwangi', 'Achieng', 'Kiprop', 'Mohamed', 'Njeri', 'Kamau', 'Chebet',
    'Odhiambo', 'Mutua', 'Wafula', 'Kariuki', 'Ali', 'Jeptoo'
]

# County -> (registered voters, constituencies)
DEMO_COUNTIES = {
    'Nairobi': (34, ['Westlands', 'Langata', 'Kibra', 'Roysambu']),
    'Mombasa': (22, ['Nyali', 'Kisauni', 'Likoni', 'Changamwe']),
    'Kisumu': (20, ['Kisumu Central', 'Kisumu East', 'Seme', 'Nyando']),
    'Nakuru': (24, ['Nakuru Town East', 'Naivasha', 'Gilgil', 'Molo']),
    'Eldoret': (16, ['Ainabkoi', 'Kapseret', 'Kesses', 'Turbo']),
}
TURNOUT_RATE = 0.74
VOTING_HOURS = 10

# First demo national ID; demo voters use 20000001, 20000002, ...
FIRST_DEMO_ID = 20000001


def _weighted_choice(rng, candidates):
    # Earlier candidates on the ballot get a little more support, so races have clear leaders
    weights = [len(candidates) - i + 1 for i in range(len(candidates))]
    return rng.choices(candidates, weights=weights)[0]


def seed_demo_data(db):
    if db.query(Voter).count() > 0:
        return

    election = db.query(Election).order_by(Election.id).first()
    candidates = db.query(Candidate).filter(Candidate.election_id == election.id).all()
    presidential = [c for c in candidates if c.position == 'Presidential']

    rng = random.Random(2027)  # same demo data every time
    password_hash = hash_password(config.DEMO_VOTER_PASSWORD)  # hashed once, shared by all demo voters
    now = datetime.utcnow()
    voting_started = now - timedelta(hours=VOTING_HOURS)
    national_id = FIRST_DEMO_ID

    for county, (registered, constituencies) in DEMO_COUNTIES.items():
        governors = [c for c in candidates if c.position == 'Governor' and c.county == county]
        senators = [c for c in candidates if c.position == 'Senator' and c.county == county]

        for _ in range(registered):
            constituency = rng.choice(constituencies)
            voter = Voter(
                first_name=rng.choice(FIRST_NAMES),
                last_name=rng.choice(LAST_NAMES),
                national_id_number=str(national_id),
                date_of_birth=date(rng.randint(1960, 2005), rng.randint(1, 12), rng.randint(1, 28)),
                phone_number=f"07{rng.randint(10000000, 99999999)}",
                email=f"demo{national_id}@example.com",
                gender=rng.choice(['male', 'female']),
                physical_address='',
                county=county,
                constituency=constituency,
                ward=f"{constituency} Ward",
                polling_station=f"{constituency} Primary School",
                password_hash=password_hash,
            )
            db.add(voter)
            db.flush()  # assigns voter.id
            national_id += 1

            if rng.random() > TURNOUT_RATE or not (presidential and governors and senators):
                continue

            # Busier towards the end of the day, like a real polling day
            voted_at = voting_started + timedelta(hours=VOTING_HOURS * (rng.random() ** 0.7))
            receipt_code = generate_receipt_code()
            for candidate in (_weighted_choice(rng, presidential), _weighted_choice(rng, governors),
                              _weighted_choice(rng, senators)):
                db.add(Vote(id=secrets.token_hex(16), ballot_code=receipt_code, election_id=election.id,
                            candidate_id=candidate.id, position=candidate.position))
            db.add(VoterParticipation(voter_id=voter.id, election_id=election.id, voted_at=voted_at))
            voter.has_voted = True
            db.add(AuditLog(action='ballot_cast', actor_type='voter', actor=voter.national_id_number,
                            details=f'Election {election.id}', created_at=voted_at))

    election.status = 'active'
    db.add(AuditLog(action='election_status_changed', actor_type='admin', actor=config.ADMIN_USERNAME,
                    details=f'Election {election.id}: upcoming -> active (demo data)', created_at=voting_started))
    db.commit()
