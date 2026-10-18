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
    assert version == "0001"
