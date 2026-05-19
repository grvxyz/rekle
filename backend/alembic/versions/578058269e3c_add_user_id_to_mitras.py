"""add user_id to mitras

Revision ID: 578058269e3c
Revises: 08895342637c
Create Date: 2026-05-19 02:14:40.350503

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '578058269e3c'
down_revision: Union[str, Sequence[str], None] = '08895342637c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        'mitras',
        sa.Column(
            'user_id',
            sa.Integer(),
            sa.ForeignKey('users.id'),
            nullable=True
        )
    )

def downgrade() -> None:
    op.drop_column('mitras', 'user_id')