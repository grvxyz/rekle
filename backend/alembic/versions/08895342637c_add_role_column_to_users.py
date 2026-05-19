"""add role column to users

Revision ID: 08895342637c
Revises: create_content_table
Create Date: 2026-05-19 01:31:30.882535
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = '08895342637c'
down_revision: Union[str, Sequence[str], None] = 'create_content_table'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        'users',
        sa.Column(
            'role',
            sa.String(length=20),
            nullable=False,
            server_default='user'
        )
    )


def downgrade() -> None:
    op.drop_column('users', 'role')