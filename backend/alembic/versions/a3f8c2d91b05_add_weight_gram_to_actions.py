"""add weight_gram to actions

Revision ID: a3f8c2d91b05
Revises: 111cd49774e3
Create Date: 2026-05-29 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a3f8c2d91b05'
down_revision: Union[str, None] = '111cd49774e3'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        'actions',
        sa.Column('weight_gram', sa.Integer(), nullable=True),
    )


def downgrade() -> None:
    op.drop_column('actions', 'weight_gram')
