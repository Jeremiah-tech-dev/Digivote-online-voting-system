from app.database import SessionLocal, engine, Base
from app.models import admin, election, vote, voter  # noqa: F401 - registers the tables
from app.seed import seed_database

# The API also runs this on startup; this script lets you seed without starting the server.
Base.metadata.create_all(bind=engine)

db = SessionLocal()
try:
    seed_database(db)
    print("Election, candidates and admin account (if ADMIN_PASSWORD is set) are ready.")
finally:
    db.close()
