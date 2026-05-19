"""add rejection_reason to actions

Revision ID: a1ddd33149ab
Revises: 578058269e3c
Create Date: 2026-05-19 02:55:11.630626

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = 'a1ddd33149ab'
down_revision: Union[str, Sequence[str], None] = '578058269e3c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('actions', sa.Column('rejection_reason', sa.Text(), nullable=True))


def downgrade() -> None:
    op.drop_column('actions', 'rejection_reason')