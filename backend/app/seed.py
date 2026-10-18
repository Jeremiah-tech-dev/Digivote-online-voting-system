from datetime import datetime
from app import config
from app.models.admin import Admin
from app.models.election import Candidate, Election
from app.utils.helpers import hash_password

UDA_LOGO = 'https://i.pinimg.com/736x/51/5f/05/515f05881d04a6bdc5cba5b1c3340771.jpg'
ODM_LOGO = 'https://i.pinimg.com/736x/08/8d/bb/088dbb5c7845bb7e776f6689e0803d38.jpg'
JUBILEE_LOGO = 'https://upload.wikimedia.org/wikipedia/en/thumb/7/74/Logo_for_the_Kenyan_polticial_party_Jubilee%2C_taken_from_its_official_website_jubileeparty.ke.svg/1200px-Logo_for_the_Kenyan_polticial_party_Jubilee%2C_taken_from_its_official_website_jubileeparty.ke.svg.png'

CANDIDATES = [
    # Presidential
    {'first_name': 'William Samoei', 'last_name': 'Ruto', 'party': 'UDA', 'position': 'Presidential', 'county': None, 'election_id': 1,
     'image_url': 'https://i.pinimg.com/736x/bc/2c/c0/bc2cc0013ba2a54a27181bdc2e1123eb.jpg', 'party_logo_url': UDA_LOGO},
    {'first_name': 'Rigathi', 'last_name': 'Gachagua', 'party': 'UDA', 'position': 'Presidential', 'county': None, 'election_id': 1,
     'image_url': 'https://i.pinimg.com/736x/82/ee/14/82ee1418cddf1aa8cc2bb2589f5894cf.jpg', 'party_logo_url': 'https://i.pinimg.com/736x/41/3e/05/413e05f8d2e87807dd306eeae649b659.jpg'},
    {'first_name': 'George', 'last_name': 'Wajackoyah', 'party': 'Roots Party', 'position': 'Presidential', 'county': None, 'election_id': 1,
     'image_url': 'https://i.pinimg.com/1200x/ac/25/29/ac2529b03a8f363087ff4b34933a993f.jpg', 'party_logo_url': 'https://upload.wikimedia.org/wikipedia/commons/1/1b/Roots_Party_logo.webp'},
    {'first_name': 'Jimi', 'last_name': 'Wanjigi', 'party': 'Safina', 'position': 'Presidential', 'county': None, 'election_id': 1,
     'image_url': 'https://i.pinimg.com/1200x/32/f3/67/32f36746ccf72f50c601fc71518e830b.jpg', 'party_logo_url': 'https://upload.wikimedia.org/wikipedia/en/thumb/b/b0/Safina_logo.png/200px-Safina_logo.png'},

    # Nairobi Governors
    {'first_name': 'Johnson', 'last_name': 'Sakaja', 'party': 'UDA', 'position': 'Governor', 'county': 'Nairobi', 'election_id': 1,
     'image_url': 'https://i.pinimg.com/1200x/59/2b/be/592bbe7301b5ddafea58c6a8b5a8e1b1.jpg', 'party_logo_url': UDA_LOGO},
    {'first_name': 'Polycarp', 'last_name': 'Igathe', 'party': 'Jubilee', 'position': 'Governor', 'county': 'Nairobi', 'election_id': 1,
     'image_url': 'https://media.licdn.com/dms/image/v2/D4D03AQGxiPQ8q2Bykg/profile-displayphoto-shrink_200_200/B4DZWA4w55GkAY-/0/1741624120104?e=2147483647&v=beta&t=rxSPyLN74oCot4EBXAd8U9oang-1Ue7DnMcvn5hkEgs', 'party_logo_url': JUBILEE_LOGO},

    # Nairobi Senators
    {'first_name': 'Edwin', 'last_name': 'Sifuna', 'party': 'ODM', 'position': 'Senator', 'county': 'Nairobi', 'election_id': 1,
     'image_url': 'https://i.pinimg.com/1200x/8f/6b/81/8f6b811cbe7a45354822842514ff8edf.jpg', 'party_logo_url': ODM_LOGO},
    {'first_name': 'Karen', 'last_name': 'Nyamu', 'party': 'UDA', 'position': 'Senator', 'county': 'Nairobi', 'election_id': 1,
     'image_url': 'https://i.pinimg.com/1200x/d3/19/58/d31958b5eba4400181394a560521dc7e.jpg', 'party_logo_url': UDA_LOGO},

    # Mombasa Governors
    {'first_name': 'Abdulswamad', 'last_name': 'Nassir', 'party': 'ODM', 'position': 'Governor', 'county': 'Mombasa', 'election_id': 1,
     'image_url': 'https://i.pinimg.com/1200x/2a/f8/e8/2af8e80023afd53d128978d4b383024c.jpg', 'party_logo_url': ODM_LOGO},
    {'first_name': 'Hassan Omar', 'last_name': 'Hassan', 'party': 'UDA', 'position': 'Governor', 'county': 'Mombasa', 'election_id': 1,
     'image_url': 'https://i.pinimg.com/736x/b0/25/25/b02525da46b879adbaa485df16938fc2.jpg', 'party_logo_url': UDA_LOGO},

    # Mombasa Senators
    {'first_name': 'Mohamed', 'last_name': 'Faki', 'party': 'ODM', 'position': 'Senator', 'county': 'Mombasa', 'election_id': 1,
     'image_url': 'https://publish.eastleighvoice.co.ke/mugera_lock/uploads/2025/02/Faki-Senator.jpg', 'party_logo_url': ODM_LOGO},
    {'first_name': 'Hamisi', 'last_name': 'Mwaguya', 'party': 'UDA', 'position': 'Senator', 'county': 'Mombasa', 'election_id': 1,
     'image_url': 'https://brs.go.ke/wp-content/uploads/2025/02/Chairman.png', 'party_logo_url': UDA_LOGO},
    {'first_name': 'Abdulsalam', 'last_name': 'Kassim', 'party': 'Wiper', 'position': 'Senator', 'county': 'Mombasa', 'election_id': 1,
     'image_url': 'https://images.hivisasa.com/1200/VOI31krQoRAbdulsalam.jpg', 'party_logo_url': 'https://wiper.co.ke/static/assets/img/wiperlogo.png'},

    # Kisumu Governors
    {'first_name': 'Peter Anyang', 'last_name': 'Nyongo', 'party': 'ODM', 'position': 'Governor', 'county': 'Kisumu', 'election_id': 1,
     'image_url': 'https://www.uclga.org/wp-content/uploads/2022/02/Governeur-de-Kisumu-bis.jpg', 'party_logo_url': ODM_LOGO},
    {'first_name': 'Jack Nyanungo', 'last_name': 'Ranguma', 'party': 'Independent', 'position': 'Governor', 'county': 'Kisumu', 'election_id': 1,
     'image_url': 'https://images.hivisasa.com/1200/jcP7Gr2B8pRA.jpg', 'party_logo_url': None},

    # Kisumu Senators
    {'first_name': 'Tom', 'last_name': 'Ojienda', 'party': 'ODM', 'position': 'Senator', 'county': 'Kisumu', 'election_id': 1,
     'image_url': 'https://thelawyer.africa/wp-content/uploads/2023/09/Ojienda-Full.jpg', 'party_logo_url': ODM_LOGO},
    {'first_name': 'Enos', 'last_name': 'Okolo', 'party': 'Jubilee', 'position': 'Senator', 'county': 'Kisumu', 'election_id': 1,
     'image_url': 'https://cdgsomaliland.org/wp-content/uploads/2019/12/3.jpg', 'party_logo_url': JUBILEE_LOGO},

    # Nakuru Governors
    {'first_name': 'Susan', 'last_name': 'Kihika', 'party': 'UDA', 'position': 'Governor', 'county': 'Nakuru', 'election_id': 1,
     'image_url': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQGYu2ZB1v0EguWDBqm8KqyobAul5-Kf77Mew&s', 'party_logo_url': UDA_LOGO},
    {'first_name': 'Lee', 'last_name': 'Kinyanjui', 'party': 'Jubilee', 'position': 'Governor', 'county': 'Nakuru', 'election_id': 1,
     'image_url': 'https://nakurunews.co.ke/wp-content/uploads/2020/06/lee-kinyanjui-11.jpg', 'party_logo_url': JUBILEE_LOGO},

    # Nakuru Senators
    {'first_name': 'Tabitha Karanja', 'last_name': 'Keroche', 'party': 'UDA', 'position': 'Senator', 'county': 'Nakuru', 'election_id': 1,
     'image_url': 'https://mzalendo.com/media/member_pics/Tabitha_Karanja.png', 'party_logo_url': UDA_LOGO},
    {'first_name': 'Lawrence', 'last_name': 'Karanja', 'party': 'Jubilee', 'position': 'Senator', 'county': 'Nakuru', 'election_id': 1,
     'image_url': 'https://peopledaily.digital/wp-content/uploads/2020/09/Lawrence-Karanja-.gif', 'party_logo_url': JUBILEE_LOGO},
    {'first_name': 'John', 'last_name': 'Mututho', 'party': 'ODM', 'position': 'Senator', 'county': 'Nakuru', 'election_id': 1,
     'image_url': 'https://pbs.twimg.com/profile_images/1543725734/bust_200_400x400.jpg', 'party_logo_url': ODM_LOGO},

    # Eldoret Governors
    {'first_name': 'Jonathan', 'last_name': 'Bii', 'party': 'UDA', 'position': 'Governor', 'county': 'Eldoret', 'election_id': 1,
     'image_url': 'https://uasingishu.go.ke/wp-content/uploads/2023/06/2nd-governor.jpg', 'party_logo_url': UDA_LOGO},
    {'first_name': 'Zedekiah Bundotich', 'last_name': 'Buzeki', 'party': 'Independent', 'position': 'Governor', 'county': 'Eldoret', 'election_id': 1,
     'image_url': 'https://cdn.standardmedia.co.ke/images/saturday/votczujcl52evcjox593c2f1d97f3b.jpg', 'party_logo_url': None},

    # Eldoret Senators
    {'first_name': 'Jackson', 'last_name': 'Mandago', 'party': 'UDA', 'position': 'Senator', 'county': 'Eldoret', 'election_id': 1,
     'image_url': 'https://pbs.twimg.com/media/GwoZ26kXkAAFQj9.jpg', 'party_logo_url': UDA_LOGO},
    {'first_name': 'Robert Arap', 'last_name': 'Kemei', 'party': 'Independent', 'position': 'Senator', 'county': 'Eldoret', 'election_id': 1,
     'image_url': 'https://www.uasingishunews.co.ke/wp-content/uploads/2021/12/Arap-kemei.jpg', 'party_logo_url': None},
]


def seed_database(db):
    """Create the election, its candidates and the first admin if they are missing.
    Safe to run many times: existing rows are left untouched."""
    # The database assigns the ID (1 on a fresh database). Setting it by hand
    # would put PostgreSQL's ID counter out of step.
    election = db.query(Election).order_by(Election.id).first()
    if not election:
        election = Election(
            title="Kenya General Election 2027",
            description="National and County Elections",
            election_type="General",
            start_date=datetime(2027, 8, 9),
            end_date=datetime(2027, 8, 9),
            status="upcoming"
        )
        db.add(election)
        db.commit()

    # Candidates are only seeded into an empty election, so ones an admin
    # deleted don't come back on the next restart
    if db.query(Candidate).count() == 0:
        for candidate_data in CANDIDATES:
            db.add(Candidate(**{**candidate_data, 'election_id': election.id}))
        db.commit()

    if config.DEMO_DATA:
        from app.demo import seed_demo_data
        seed_demo_data(db)
    
    if config.ADMIN_PASSWORD and not db.query(Admin).filter(Admin.username == config.ADMIN_USERNAME).first():
        db.add(Admin(username=config.ADMIN_USERNAME, password_hash=hash_password(config.ADMIN_PASSWORD)))
        db.commit()
