from app import create_app, db
from app.models.election import Candidate

app = create_app()

with app.app_context():
    # Presidential Candidates
    candidates = [
        # Presidential
        {'id': 1, 'first_name': 'William Samoei', 'last_name': 'Ruto', 'party': 'UDA', 'position': 'Presidential', 'county': None, 'election_id': 1},
        {'id': 2, 'first_name': 'Rigathi', 'last_name': 'Gachagua', 'party': 'UDA', 'position': 'Presidential', 'county': None, 'election_id': 1},
        {'id': 3, 'first_name': 'George', 'last_name': 'Wajackoyah', 'party': 'Roots Party', 'position': 'Presidential', 'county': None, 'election_id': 1},
        {'id': 4, 'first_name': 'Jimi', 'last_name': 'Wanjigi', 'party': 'Safina', 'position': 'Presidential', 'county': None, 'election_id': 1},
        
        # Nairobi Governors
        {'id': 5, 'first_name': 'Johnson', 'last_name': 'Sakaja', 'party': 'UDA', 'position': 'Governor', 'county': 'Nairobi', 'election_id': 1},
        {'id': 6, 'first_name': 'Polycarp', 'last_name': 'Igathe', 'party': 'Jubilee', 'position': 'Governor', 'county': 'Nairobi', 'election_id': 1},
        
        # Nairobi Senators
        {'id': 7, 'first_name': 'Edwin', 'last_name': 'Sifuna', 'party': 'ODM', 'position': 'Senator', 'county': 'Nairobi', 'election_id': 1},
        {'id': 8, 'first_name': 'Karen', 'last_name': 'Nyamu', 'party': 'UDA', 'position': 'Senator', 'county': 'Nairobi', 'election_id': 1},
        
        # Mombasa Governors
        {'id': 9, 'first_name': 'Abdulswamad', 'last_name': 'Nassir', 'party': 'ODM', 'position': 'Governor', 'county': 'Mombasa', 'election_id': 1},
        {'id': 10, 'first_name': 'Hassan Omar', 'last_name': 'Hassan', 'party': 'UDA', 'position': 'Governor', 'county': 'Mombasa', 'election_id': 1},
        
        # Mombasa Senators
        {'id': 11, 'first_name': 'Mohamed', 'last_name': 'Faki', 'party': 'ODM', 'position': 'Senator', 'county': 'Mombasa', 'election_id': 1},
        {'id': 12, 'first_name': 'Hamisi', 'last_name': 'Mwaguya', 'party': 'UDA', 'position': 'Senator', 'county': 'Mombasa', 'election_id': 1},
        {'id': 13, 'first_name': 'Abdulsalam', 'last_name': 'Kassim', 'party': 'Wiper', 'position': 'Senator', 'county': 'Mombasa', 'election_id': 1},
        
        # Kisumu Governors
        {'id': 14, 'first_name': 'Peter Anyang', 'last_name': 'Nyongo', 'party': 'ODM', 'position': 'Governor', 'county': 'Kisumu', 'election_id': 1},
        {'id': 15, 'first_name': 'Jack Nyanungo', 'last_name': 'Ranguma', 'party': 'Independent', 'position': 'Governor', 'county': 'Kisumu', 'election_id': 1},
        
        # Kisumu Senators
        {'id': 16, 'first_name': 'Tom', 'last_name': 'Ojienda', 'party': 'ODM', 'position': 'Senator', 'county': 'Kisumu', 'election_id': 1},
        {'id': 17, 'first_name': 'Enos', 'last_name': 'Okolo', 'party': 'Jubilee', 'position': 'Senator', 'county': 'Kisumu', 'election_id': 1},
        
        # Nakuru Governors
        {'id': 18, 'first_name': 'Susan', 'last_name': 'Kihika', 'party': 'UDA', 'position': 'Governor', 'county': 'Nakuru', 'election_id': 1},
        {'id': 19, 'first_name': 'Lee', 'last_name': 'Kinyanjui', 'party': 'Jubilee', 'position': 'Governor', 'county': 'Nakuru', 'election_id': 1},
        
        # Nakuru Senators
        {'id': 20, 'first_name': 'Tabitha Karanja', 'last_name': 'Keroche', 'party': 'UDA', 'position': 'Senator', 'county': 'Nakuru', 'election_id': 1},
        {'id': 21, 'first_name': 'Lawrence', 'last_name': 'Karanja', 'party': 'Jubilee', 'position': 'Senator', 'county': 'Nakuru', 'election_id': 1},
        {'id': 22, 'first_name': 'John', 'last_name': 'Mututho', 'party': 'ODM', 'position': 'Senator', 'county': 'Nakuru', 'election_id': 1},
        
        # Eldoret Governors
        {'id': 23, 'first_name': 'Jonathan', 'last_name': 'Bii', 'party': 'UDA', 'position': 'Governor', 'county': 'Eldoret', 'election_id': 1},
        {'id': 24, 'first_name': 'Zedekiah Bundotich', 'last_name': 'Buzeki', 'party': 'Independent', 'position': 'Governor', 'county': 'Eldoret', 'election_id': 1},
        
        # Eldoret Senators
        {'id': 25, 'first_name': 'Jackson', 'last_name': 'Mandago', 'party': 'UDA', 'position': 'Senator', 'county': 'Eldoret', 'election_id': 1},
        {'id': 26, 'first_name': 'Robert Arap', 'last_name': 'Kemei', 'party': 'Independent', 'position': 'Senator', 'county': 'Eldoret', 'election_id': 1},
    ]
    
    for candidate_data in candidates:
        candidate = Candidate(**candidate_data)
        db.session.add(candidate)
    
    db.session.commit()
    print("All candidates added successfully!")
