import os

from alembic import command
from alembic.config import Config
from sqlalchemy import inspect

from app.database import engine

ALEMBIC_INI = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "alembic.ini")


def run_migrations():
    """Bring the database schema up to date (the same as `alembic upgrade head`)."""
    alembic_cfg = Config(ALEMBIC_INI)
    alembic_cfg.attributes["skip_logging_config"] = True

    with engine.begin() as connection:
        alembic_cfg.attributes["connection"] = connection
        tables = set(inspect(connection).get_table_names())

        if "voters" in tables and "alembic_version" not in tables:
            # A database created before migrations were added: its tables already
            # match the first migration, so record that instead of re-creating them
            command.stamp(alembic_cfg, "0001")

        command.upgrade(alembic_cfg, "head")
