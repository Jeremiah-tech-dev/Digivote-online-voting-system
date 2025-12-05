# Digivote Backend

## Project Structure
```
backend/
├── app/
│   ├── __init__.py          # App factory
│   ├── models/              # Database models
│   │   ├── voter.py         # Voter model
│   │   ├── election.py      # Election & Candidate models
│   │   └── vote.py          # Vote model
│   ├── routes/              # API routes
│   │   ├── voter_routes.py  # Voter endpoints
│   │   └── election_routes.py # Election endpoints
│   └── utils/               # Helper functions
│       └── helpers.py       # Utility functions
├── Pipfile                  # Pipenv dependencies
├── run.py                   # Application entry point
└── README.md
```

## Features
✅ **3+ Related Tables with SQLAlchemy ORM:**
- `voters` - Stores voter registration data
- `elections` - Stores election information
- `candidates` - Stores candidate information (related to elections)
- `votes` - Stores voting records (related to voters, elections, and candidates)

✅ **Pipenv Virtual Environment:**
- Managed with Pipfile
- Clean dependency management

✅ **Proper Package Structure:**
- Modular design with separate models, routes, and utilities
- App factory pattern for Flask initialization

✅ **Python Data Structures:**
- **Lists:** Used in candidate lists, voter lists, validation errors
- **Dicts:** Used in KENYAN_COUNTIES, validation results, API responses
- **Tuples:** Used in ELECTION_TYPES, voter location data, full names

## Setup Instructions

1. Install Pipenv:
```bash
pip install pipenv
```

2. Install dependencies:
```bash
cd backend
pipenv install
```

3. Activate virtual environment:
```bash
pipenv shell
```

4. Run the application:
```bash
python run.py
```

The backend will run on `http://localhost:5000`

## Database Schema

### voters
- id, first_name, last_name, national_id_number (unique)
- date_of_birth, phone_number, email, gender
- physical_address, county, constituency, ward, polling_station
- password_hash, created_at, updated_at
- **Relationship:** One-to-Many with votes

### elections
- id, title, description, election_type
- start_date, end_date, status, created_at
- **Relationships:** One-to-Many with candidates and votes

### candidates
- id, first_name, last_name, party, position
- election_id (Foreign Key), created_at
- **Relationships:** Many-to-One with elections, One-to-Many with votes

### votes
- id, voter_id (FK), election_id (FK), candidate_id (FK)
- voted_at
- **Unique Constraint:** One vote per voter per election

## API Endpoints

### Voter Routes
- `POST /api/register` - Register new voter
- `POST /api/verify` - Verify voter details
- `GET /api/voters` - Get all voters

### Election Routes
- `GET /api/elections` - Get all elections
- `GET /api/elections/<id>/candidates` - Get candidates for election
- `POST /api/vote` - Cast a vote
- `GET /api/elections/<id>/results` - Get election results

## Data Structures Used

**Lists:**
- Candidate lists per election
- Voter lists
- Validation error lists

**Dictionaries:**
- KENYAN_COUNTIES mapping
- Validation results
- API response formatting
- Election results aggregation

**Tuples:**
- ELECTION_TYPES constant
- Voter location data (county, constituency, ward, polling_station)
- Voter full name (first_name, last_name)
