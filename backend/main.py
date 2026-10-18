from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app import config
from app.database import SessionLocal
from app.migrations import run_migrations
from app.routes import voter_routes, election_routes, vote_routes, results_routes, admin_routes
from app.seed import seed_database

# Bring the database schema up to date, then make sure the election, candidates and admin exist
run_migrations()
with SessionLocal() as db:
    seed_database(db)

app = FastAPI(title="Digivote API", version="1.3.0")

# CORS configuration: only our own frontend may call the API from a browser
app.add_middleware(
    CORSMiddleware,
    allow_origins=config.CORS_ORIGINS,
    allow_credentials=False,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
)

# Include routers
app.include_router(voter_routes.router, prefix="/api", tags=["voters"])
app.include_router(election_routes.router, prefix="/api", tags=["elections"])
app.include_router(vote_routes.router, prefix="/api", tags=["votes"])
app.include_router(results_routes.router, prefix="/api", tags=["results"])
app.include_router(admin_routes.router, prefix="/api", tags=["admin"])

@app.get("/")
def root():
    return {"message": "Digivote API - FastAPI Backend"}
