"""add status and verification fields to mitras

Revision ID: f842e74697bc
Revises: a1ddd33149ab
Create Date: 2026-05-19 03:00:14.673234

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'f842e74697bc'
down_revision: Union[str, Sequence[str], None] = 'a1ddd33149ab'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    op.add_column('mitras', sa.Column('status', sa.String(50), nullable=False, server_default='pending'))
    op.add_column('mitras', sa.Column('rejection_reason', sa.Text(), nullable=True))
    op.add_column('mitras', sa.Column('verified_by', sa.Integer(), sa.ForeignKey('users.id'), nullable=True))
    op.add_column('mitras', sa.Column('verified_at', sa.DateTime(), nullable=True))


def downgrade() -> None:
    op.drop_column('mitras', 'verified_at')
    op.drop_column('mitras', 'verified_by')
    op.drop_column('mitras', 'rejection_reason')
    op.drop_column('mitras', 'status')