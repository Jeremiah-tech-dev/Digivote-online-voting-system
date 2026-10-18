from app.database import SessionLocal
from app.migrations import run_migrations
from app.seed import seed_database

# The API also runs this on startup; this script lets you seed without starting the server.
run_migrations()

db = SessionLocal()
try:
    seed_database(db)
    print("Election, candidates and admin account (if ADMIN_PASSWORD is set) are ready.")
finally:
    db.close()
