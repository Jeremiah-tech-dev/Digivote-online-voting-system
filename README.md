# Digivote Online Voting System

A secure and modern online voting platform for Kenya's electoral process, built with React and FastAPI.

## Live Demo

🔗 [https://digivote-online-voting-system.vercel.app/](https://digivote-online-voting-system.vercel.app/)

## Features

### Voter Features
- **Voter Registration**: Register with national ID, personal details, and location information
- **Voter Verification**: Verify voting details using ID number and year of birth
- **Secure Login**: Password-protected voter authentication
- **Step-by-Step Voting**: Sequential voting process (Presidential → Governor → Senator)
- **County-Based Voting**: Voters only see candidates from their registered county
- **One-Time Voting**: System prevents multiple votes from same voter

### Admin Features
- **Admin Dashboard**: View real-time election results
- **Secure Access**: Admin accounts stored in the database with hashed passwords; results are only served to a signed-in admin
- **Results Display**: Shows vote counts for all candidates organized by position and county
- **Total Votes Counter**: Displays total votes cast across all positions

### Positions & Counties
- **Presidential**: 4 candidates (national level)
- **Governors**: 2 candidates per county (Nairobi, Mombasa, Kisumu, Nakuru, Eldoret)
- **Senators**: 2-3 candidates per county (Nairobi, Mombasa, Kisumu, Nakuru, Eldoret)

## Tech Stack

### Frontend
- React.js
- React Icons
- CSS3

### Backend
- FastAPI (Python)
- SQLAlchemy ORM
- SQLite Database
- CORS Middleware
- Pydantic for data validation
- PyJWT for token-based authentication
- Uvicorn ASGI server
- pytest for automated tests

## Installation

### Prerequisites
- Node.js (v14+)
- Python (v3.11)
- Pipenv

### Backend Setup

```bash
cd backend
pipenv install --dev

# Secrets come from environment variables (see backend/.env.example)
export SECRET_KEY="$(python -c 'import secrets; print(secrets.token_urlsafe(32))')"
export ADMIN_USERNAME=admin
export ADMIN_PASSWORD='choose-a-strong-password'

pipenv run uvicorn main:app --reload --port 5000
```

On startup the API creates the database tables, the election, all candidates, and the
admin account from `ADMIN_USERNAME` / `ADMIN_PASSWORD` (if it doesn't exist yet).
`seed_candidates.py` does the same without starting the server.

Backend runs on `http://localhost:5000`

### Environment Variables

| Variable | Required | Purpose |
|---|---|---|
| `SECRET_KEY` | Yes (in production) | Signs login tokens. If unset, a random key is used and everyone is logged out on restart. |
| `ADMIN_USERNAME` | No (default `admin`) | Username of the first admin account |
| `ADMIN_PASSWORD` | Yes, to create the admin | Password of the first admin account |
| `CORS_ORIGINS` | No | Comma-separated frontend URLs allowed to call the API |
| `DATABASE_URL` | No | Defaults to SQLite at `backend/instance/voters.db` |
| `VOTER_TOKEN_EXPIRE_MINUTES` / `ADMIN_TOKEN_EXPIRE_MINUTES` | No | Login lifetime (default 30 / 60) |

### Running the Tests

```bash
cd backend && pipenv run pytest      # API security and validation tests
cd digivote && npm test              # frontend tests
```

API Documentation available at `http://localhost:5000/docs`

### Frontend Setup

```bash
cd digivote
npm install
npm start
```

Frontend runs on `http://localhost:3000`

## Usage

### For Voters

1. **Register**: Click "Register as Voter" and fill in your details
2. **Login**: Use your national ID and password to login
3. **Vote**: Click "Vote Now" and follow the step-by-step process
   - Choose a Presidential candidate
   - Choose a Governor (your county)
   - Choose a Senator (your county)
4. **Review and submit**: Check your choices, then submit the whole ballot at once
5. **Confirmation**: Receive confirmation after successful voting

### For Admins

1. Click "Admin" button in the navbar
2. Login with the admin account created from `ADMIN_USERNAME` / `ADMIN_PASSWORD`
3. View election results dashboard

## API Endpoints

All endpoints are under `/api`. 🔒 = needs a voter token, 🛡️ = needs an admin token
(sent as `Authorization: Bearer <token>`).

| Method | Path | Access | Description |
|---|---|---|---|
| POST | `/register` | Public | Register a voter (validated) |
| POST | `/verify` | Public | Check registration details by ID and year of birth |
| POST | `/login` | Public | Voter login, returns a token |
| GET | `/me` | 🔒 | The logged-in voter's details |
| POST | `/votes` | 🔒 | Cast a complete ballot (president, governor, senator) |
| GET | `/stats` | Public | Total registered voters and turnout |
| GET | `/elections`, `/elections/{id}/candidates` | Public | Election and candidate lists |
| POST | `/admin/login` | Public | Admin login, returns a token |
| GET | `/results`, `/elections/{id}/results` | 🛡️ | Vote totals |
| GET | `/voters`, `/voters/{id}` | 🛡️ | Registered voters |

## API Documentation

FastAPI provides automatic interactive API documentation:
- Swagger UI: `http://localhost:5000/docs`
- ReDoc: `http://localhost:5000/redoc`

## Database Schema

### Voters Table
- Personal information (name, ID, DOB, contact)
- Location (county, constituency, ward, polling station)
- Password hash
- Voting status (has_voted)

### Candidates Table
- Candidate information (name, party)
- Position (Presidential, Governor, Senator)
- County (for county-level positions)

### Votes Table
- Voter ID
- Candidate ID
- Election ID
- Position (unique per voter and election, so nobody can vote twice for the same office)
- Timestamp

### Admins Table
- Username
- Password hash

### Elections Table
- Election details (title, description, type)
- Start and end dates
- Status (upcoming, active, completed)

## Security Features

- **Password hashing** with bcrypt for voters and admins
- **Token authentication (JWT)**: signed, expiring tokens; the server identifies the voter from the token, never from data the browser sends
- **Server-side voting rules**: one ballot per voter, candidates must match the position and the voter's county, and voting only while the election is active
- **Atomic ballots**: all three votes and the "has voted" flag are saved in one database transaction, so a ballot is either fully counted or not at all
- **Database-level guarantee**: a unique constraint blocks a second vote for the same position even if two requests arrive at the same moment
- **Role-based access**: results and voter lists are admin-only; voter tokens cannot access admin endpoints
- **Input validation** with Pydantic: Kenyan ID and phone formats, minimum voting age of 18, password strength, valid counties
- **No user enumeration**: verification gives the same response for an unknown ID and a wrong year of birth
- **Restricted CORS**: only the project's own frontend origins may call the API from a browser
- **Secrets in environment variables**, never in the code
- **SQL injection prevention** with SQLAlchemy ORM

## Project Structure

```
Digivote-online-voting-system/
├── backend/
│   ├── app/
│   │   ├── models/
│   │   │   ├── admin.py
│   │   │   ├── voter.py
│   │   │   ├── election.py
│   │   │   └── vote.py
│   │   ├── routes/
│   │   │   ├── admin_routes.py
│   │   │   ├── voter_routes.py
│   │   │   ├── election_routes.py
│   │   │   ├── vote_routes.py
│   │   │   └── results_routes.py
│   │   ├── utils/
│   │   │   └── helpers.py
│   │   ├── auth.py          # JWT creation and access checks
│   │   ├── config.py        # settings from environment variables
│   │   ├── database.py
│   │   ├── schemas.py       # request validation rules
│   │   ├── seed.py          # election, candidates and first admin
│   │   └── __init__.py
│   ├── tests/               # pytest suite
│   ├── .env.example
│   ├── Pipfile
│   ├── requirements.txt
│   ├── requirements-dev.txt
│   ├── seed_candidates.py
│   └── main.py
├── digivote/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── api.js           # shared API client
│   │   ├── App.js
│   │   └── App.css
│   └── package.json
└── README.md
```

## License

MIT License
