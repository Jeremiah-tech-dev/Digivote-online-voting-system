from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routes import voter_routes, election_routes, vote_routes, results_routes

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Digivote API", version="1.0.0")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(voter_routes.router, prefix="/api", tags=["voters"])
app.include_router(election_routes.router, prefix="/api", tags=["elections"])
app.include_router(vote_routes.router, prefix="/api", tags=["votes"])
app.include_router(results_routes.router, prefix="/api", tags=["results"])

@app.get("/")
def root():
    return {"message": "Digivote API - FastAPI Backend"}
