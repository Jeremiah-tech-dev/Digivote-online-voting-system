"""clear an expired candidate photo link

The seeded LinkedIn photo for Polycarp Igathe now returns 404. Candidates can't be
edited in the admin portal once votes exist, so this clears the dead link directly;
the site shows the IEBC logo instead. Only the photo link changes, never votes.

Revision ID: 0002
Revises: 0001
Create Date: 2026-10-18
"""
from alembic import op
import sqlalchemy as sa


revision = '0002'
down_revision = '0001'
branch_labels = None
depends_on = None

EXPIRED_PHOTO_PREFIX = 'https://media.licdn.com/dms/image/v2/D4D03AQGxiPQ8q2Bykg/'


def upgrade():
    candidates = sa.table('candidates', sa.column('image_url', sa.String))
    op.execute(
        candidates.update()
        .where(candidates.c.image_url.like(EXPIRED_PHOTO_PREFIX + '%'))
        .values(image_url=None)
    )


def downgrade():
    # The old link is dead, so there is nothing useful to restore
    pass
