import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.config import DATABASE_URL, DEFAULT_SQLITE_PATH

if DATABASE_URL.startswith("sqlite"):
    os.makedirs(os.path.dirname(DEFAULT_SQLITE_PATH), exist_ok=True)
    connect_args = {"check_same_thread": False}
else:
    connect_args = {}

# pool_pre_ping replaces database connections that were closed by the server
engine = create_engine(DATABASE_URL, connect_args=connect_args, pool_pre_ping=True)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
