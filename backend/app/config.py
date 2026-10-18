import os
import secrets
import warnings

# All settings come from environment variables so secrets never live in the code.
# See backend/.env.example for the full list.

SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    # Fine for local development, but tokens become invalid on every restart.
    SECRET_KEY = secrets.token_urlsafe(32)
    warnings.warn("SECRET_KEY is not set; using a random key for this run only.")

JWT_ALGORITHM = "HS256"
VOTER_TOKEN_EXPIRE_MINUTES = int(os.getenv("VOTER_TOKEN_EXPIRE_MINUTES", "30"))
ADMIN_TOKEN_EXPIRE_MINUTES = int(os.getenv("ADMIN_TOKEN_EXPIRE_MINUTES", "60"))

BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEFAULT_SQLITE_PATH = os.path.join(BACKEND_DIR, "instance", "voters.db")
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{DEFAULT_SQLITE_PATH}")

CORS_ORIGINS = [
    origin.strip()
    for origin in os.getenv(
        "CORS_ORIGINS",
        "http://localhost:3000,https://digivote-online-voting-system.vercel.app",
    ).split(",")
    if origin.strip()
]

# The first admin account is created on startup from these values (if set).
ADMIN_USERNAME = os.getenv("ADMIN_USERNAME", "admin")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD")
