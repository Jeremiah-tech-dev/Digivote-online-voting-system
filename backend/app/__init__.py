from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

db = SQLAlchemy()

def create_app():
    app = Flask(__name__)
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///voters.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    db.init_app(app)
    CORS(app)
    
    # Import models before creating tables
    from app.models.voter import Voter
    from app.models.election import Election, Candidate
    from app.models.vote import Vote
    
    with app.app_context():
        db.create_all()
    
    from app.routes import voter_routes, election_routes
    from app.routes import vote_routes
    app.register_blueprint(voter_routes.bp)
    app.register_blueprint(election_routes.bp)
    app.register_blueprint(vote_routes.bp)
    
    return app
