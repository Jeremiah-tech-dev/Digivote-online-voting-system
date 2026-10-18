# Digivote Online Voting System

![CI](https://github.com/Jeremiah-tech-dev/Digivote-online-voting-system/actions/workflows/ci.yml/badge.svg)

A secure and modern online voting platform for Kenya's electoral process, built with React and FastAPI.

## Quick Start (Docker)

The fastest way to run the whole system (PostgreSQL, API and website) is one command:

```bash
docker compose up --build
```

Then open **http://localhost:3000**. The database is filled with demo data, so the admin
portal has charts straight away:

- **Admin:** http://localhost:3000/admin — username `admin`, password `Admin12345`
- **Voter:** log in with national ID `20000035` and password `Demo1234` (one of the demo voters who hasn't voted yet)
- **API docs:** http://localhost:5000/docs

Copy `.env.example` to `.env` to change the passwords, or set `DEMO_DATA=false` for an empty election.
Run `docker compose down -v` to delete the database and start again.

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
- **Review Before Submitting**: Voters check all three choices before the ballot is cast
- **Ballot Receipt**: After voting, voters get a receipt code to confirm their ballot was counted (it never reveals their choices)

### Admin Features
- **Admin Portal**: A full dashboard built with Apache ECharts
  - **Live Results**: turnout gauge, presidential bar chart and vote-share donut, turnout over time, race leaders, turnout by county, and Governor/Senator charts per county; refreshes every 10 seconds, with a table view
  - **Election Control**: open and close voting (upcoming → active → closed; closing is final)
  - **Candidates**: add, edit and remove candidates before voting starts
  - **Voters**: searchable list of registered voters
  - **Audit Log**: logins, failed logins, ballots cast and every admin action
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
- React Router (each page has its own address)
- Apache ECharts (admin charts, loaded only for admins)
- React Icons
- CSS3

### Backend
- FastAPI (Python)
- SQLAlchemy ORM
- PostgreSQL in production and Docker; SQLite for quick local development
- Alembic database migrations
- CORS Middleware
- Pydantic for data validation
- PyJWT for token-based authentication
- Uvicorn ASGI server
- pytest for automated tests

### Tooling
- Docker and Docker Compose
- GitHub Actions CI: runs the backend tests on SQLite **and** PostgreSQL, plus the frontend tests and build, on every push

## Manual Installation (without Docker)

### Prerequisites
- Node.js (v18+)
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

On startup the API applies any pending database migrations, then creates the election,
all candidates, and the admin account from `ADMIN_USERNAME` / `ADMIN_PASSWORD` (if they
don't exist yet). `seed_candidates.py` does the same without starting the server.

Without `DATABASE_URL` the API uses a SQLite file, so no database server is needed for
development. To use PostgreSQL, set for example
`DATABASE_URL=postgresql://user:password@localhost:5432/digivote`.

### Database Migrations

The database schema is managed with Alembic (`backend/migrations/`). Migrations run
automatically on startup; to work with them by hand:

```bash
cd backend
pipenv run alembic upgrade head                            # apply migrations
pipenv run alembic revision --autogenerate -m "describe"   # after changing a model
```

Backend runs on `http://localhost:5000`

### Environment Variables

| Variable | Required | Purpose |
|---|---|---|
| `SECRET_KEY` | Yes (in production) | Signs login tokens. If unset, a random key is used and everyone is logged out on restart. |
| `ADMIN_USERNAME` | No (default `admin`) | Username of the first admin account |
| `ADMIN_PASSWORD` | Yes, to create the admin | Password of the first admin account |
| `DEMO_DATA` | No | Set to `true` to fill an empty database with sample voters and ballots for demonstrations |
| `DEMO_VOTER_PASSWORD` | No (default `Demo1234`) | Password shared by all demo voters |
| `CORS_ORIGINS` | No | Comma-separated frontend URLs allowed to call the API |
| `DATABASE_URL` | No | PostgreSQL connection URL (`postgres://` or `postgresql://`). Defaults to SQLite at `backend/instance/voters.db` |
| `VOTER_TOKEN_EXPIRE_MINUTES` / `ADMIN_TOKEN_EXPIRE_MINUTES` | No | Login lifetime (default 30 / 60) |

### Running the Tests

```bash
cd backend && pipenv run pytest      # API: security, voting rules, validation, migrations
cd digivote && npm test              # frontend: routing, forms, voting flow, API client

# Run the backend tests against PostgreSQL (the database must be empty)
TEST_DATABASE_URL=postgresql://user:password@localhost:5432/digivote_test pipenv run pytest
```

GitHub Actions runs all of these on every push (`.github/workflows/ci.yml`).

API Documentation available at `http://localhost:5000/docs`

### Frontend Setup

```bash
cd digivote
npm install
npm start
```

Frontend runs on `http://localhost:3000`

### Deployment

- **Frontend (Vercel):** project root `digivote`, environment variable `REACT_APP_API_URL`
  set to the backend URL. `digivote/vercel.json` sends every address to the React app, so
  links like `/admin` or `/login` work when opened directly.
- **Backend (Render):** root `backend`, build `pip install -r requirements.txt`, start
  `uvicorn main:app --host 0.0.0.0 --port $PORT`. Create a Render PostgreSQL database and
  set `DATABASE_URL` to its internal URL, so data survives redeploys. Also set `SECRET_KEY`,
  `ADMIN_PASSWORD`, and `DEMO_DATA=true` for a demo.

## Pages

| Address | Page |
|---|---|
| `/` | Home page |
| `/register` | Voter registration |
| `/verify` | Check registration details |
| `/login` | Voter login |
| `/vote` | Voting portal (voters only) |
| `/receipt` | Check a ballot receipt |
| `/admin/login` | Admin login |
| `/admin` | Admin portal (admins only) |

A login is kept for the browser tab (so refreshing doesn't log you out) and ends when
the tab is closed, the token expires, or the server rejects it.

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

### Demo Mode

For presentations, start the backend with `DEMO_DATA=true` on an empty database. It creates
116 sample voters across the five counties, opens the election, and has about three quarters
of them vote over the previous ten hours, so every admin chart has data. Demo voters have
national IDs `20000001` to `20000116` and the password `Demo1234`; the ones who haven't voted
yet can log in and vote live during a demo.

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
| POST | `/votes` | 🔒 | Cast a complete ballot (president, governor, senator); returns a receipt code |
| GET | `/receipts/{code}` | Public | Confirm a ballot was counted (doesn't reveal choices) |
| GET | `/stats` | Public | Total registered voters and turnout |
| GET | `/elections`, `/elections/{id}/candidates` | Public | Election and candidate lists |
| POST | `/admin/login` | Public | Admin login, returns a token |
| GET | `/results`, `/elections/{id}/results` | 🛡️ | Vote totals |
| GET | `/voters`, `/voters/{id}` | 🛡️ | Registered voters |
| PUT | `/admin/elections/{id}/status` | 🛡️ | Open or close voting |
| POST | `/admin/elections/{id}/candidates` | 🛡️ | Add a candidate (before voting starts) |
| PUT / DELETE | `/admin/candidates/{id}` | 🛡️ | Edit or remove a candidate (before voting starts) |
| GET | `/admin/audit-log` | 🛡️ | Latest security events |

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
- Candidate information (name, party, photo and party logo links)
- Position (Presidential, Governor, Senator)
- County (for county-level positions)

### Votes Table (what was voted for, never who voted)
- Random ID (not sequential, so row order doesn't reveal voting order)
- Ballot receipt code
- Candidate ID, Election ID, Position
- No voter ID and no timestamp

### Voter Participation Table (who voted, never what for)
- Voter ID, Election ID, time voted
- Unique per voter and election, so the database itself blocks a second ballot

### Audit Logs Table
- Action, who did it, details, time

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
- **Database-level guarantee**: a unique constraint blocks a second ballot even if two requests arrive at the same moment
- **Ballot secrecy**: who voted and what they voted for are stored in separate tables with nothing linking them
- **Receipt-freeness**: the ballot receipt confirms a vote was counted but can't prove who it was for, which prevents vote buying
- **Locked results**: candidates can't be changed once votes exist, and a closed election can't be reopened
- **Audit trail**: every login, failed login, ballot and admin action is recorded
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
│   │   │   ├── audit_log.py
│   │   │   ├── voter.py
│   │   │   ├── election.py
│   │   │   └── vote.py      # anonymous votes + voter participation
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
│   │   ├── migrations.py    # runs Alembic on startup
│   │   ├── demo.py          # optional demo voters and ballots
│   │   ├── schemas.py       # request validation rules
│   │   ├── seed.py          # election, candidates and first admin
│   │   └── __init__.py
│   ├── migrations/          # Alembic database migrations
│   ├── tests/               # pytest suite
│   ├── alembic.ini
│   ├── Dockerfile
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
│   │   │   └── admin/       # admin portal panels and ECharts charts
│   │   ├── styles/          # one stylesheet per section of the site
│   │   ├── api.js           # shared API client
│   │   ├── auth.js          # who is logged in (voter / admin)
│   │   ├── candidates.js    # shared candidate display helpers
│   │   ├── App.js           # page routes
│   │   └── App.css          # imports the stylesheets in styles/
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── vercel.json
│   └── package.json
├── .github/workflows/ci.yml # automated tests
├── docker-compose.yml
├── .env.example
└── README.md
```

## License

MIT License
