from sqlalchemy import create_engine, inspect


def test_schema_matches_models(client):
    """The migrations create every table the models define"""
    from app.database import Base, engine
    tables = set(inspect(engine).get_table_names())
    assert set(Base.metadata.tables) <= tables
    assert "alembic_version" in tables


def test_database_from_before_migrations_is_adopted(tmp_path, monkeypatch):
    """A database created by the old create_all() startup is stamped, not re-created"""
    from app import migrations
    from app.database import Base

    old_engine = create_engine(f"sqlite:///{tmp_path / 'old.db'}")
    Base.metadata.create_all(bind=old_engine)
    monkeypatch.setattr(migrations, "engine", old_engine)

    migrations.run_migrations()

    with old_engine.connect() as connection:
        version = connection.exec_driver_sql("SELECT version_num FROM alembic_version").scalar()
    assert version == "0002"


def test_expired_photo_link_is_cleared(tmp_path, monkeypatch):
    """Migration 0002 replaces the dead photo link without touching anything else"""
    from app import migrations
    from app.database import Base

    old_engine = create_engine(f"sqlite:///{tmp_path / 'photo.db'}")
    Base.metadata.create_all(bind=old_engine)
    with old_engine.begin() as connection:
        connection.exec_driver_sql("INSERT INTO elections (id, title, election_type, start_date, end_date, status) "
                                   "VALUES (1, 'E', 'General', '2027-08-09', '2027-08-09', 'active')")
        connection.exec_driver_sql("INSERT INTO candidates (first_name, last_name, party, position, county, image_url, election_id) VALUES "
                                   "('Polycarp', 'Igathe', 'Jubilee', 'Governor', 'Nairobi', 'https://media.licdn.com/dms/image/v2/D4D03AQGxiPQ8q2Bykg/x.jpg', 1), "
                                   "('Johnson', 'Sakaja', 'UDA', 'Governor', 'Nairobi', 'https://example.com/sakaja.jpg', 1)")
    monkeypatch.setattr(migrations, "engine", old_engine)

    migrations.run_migrations()

    with old_engine.connect() as connection:
        photos = dict(connection.exec_driver_sql("SELECT last_name, image_url FROM candidates").all())
    assert photos == {"Igathe": None, "Sakaja": "https://example.com/sakaja.jpg"}
