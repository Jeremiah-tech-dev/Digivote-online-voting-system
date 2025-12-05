# Digivote Online Voting System

A secure and modern online voting platform for Kenya's electoral process, built with React and Flask.

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
- **Secure Access**: Protected with admin credentials (username: admin, password: admin2025)
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
- (Python)
- SQLAlchemy ORM
- SQLite Database
- python-CORS

## Installation

### Prerequisites
- Node.js (v14+)
- Python (v3.8+)
- Pipenv

### Backend Setup

```bash
cd backend
pipenv install
pipenv run python seed_candidates.py
pipenv run python run.py
```

Backend runs on `http://localhost:5000`

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
   - Vote for Presidential candidate
   - Vote for Governor (your county)
   - Vote for Senator (your county)
4. **Confirmation**: Receive confirmation after successful voting

### For Admins

1. Click "Admin" button in the navbar
2. Login with credentials:
   - Username: `admin`
   - Password: `admin2025`
3. View election results dashboard

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
- Timestamp

## Security Features

- Password hashing for voter accounts
- One vote per voter enforcement
- Admin authentication
- CORS protection
- Session management

## Project Structure

```
Digivote-online-voting-system/
├── backend/
│   ├── app/
│   │   ├── models/
│   │   ├── routes/
│   │   └── utils/
│   ├── instance/
│   ├── seed_candidates.py
│   └── run.py
├── digivote/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── App.js
│   │   └── App.css
│   └── package.json
└── README.md
```

## License

MIT License
