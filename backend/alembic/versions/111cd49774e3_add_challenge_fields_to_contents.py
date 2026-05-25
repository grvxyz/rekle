"""add challenge fields to contents

Revision ID: 111cd49774e3
Revises: f842e74697bc
Create Date: 2026-05-26

"""

from alembic import op
import sqlalchemy as sa


# revision identifiers
revision = "111cd49774e3"
down_revision = "f842e74697bc"
branch_labels = None
depends_on = None


def upgrade():

    op.add_column(
        "contents",
        sa.Column(
            "challenge_type",
            sa.String(length=50),
            nullable=True,
        ),
    )

    op.add_column(
        "contents",
        sa.Column(
            "target",
            sa.Integer(),
            nullable=True,
        ),
    )

    op.add_column(
        "contents",
        sa.Column(
            "reward_points",
            sa.Integer(),
            nullable=True,
            server_default="0",
        ),
    )


def downgrade():

    op.drop_column(
        "contents",
        "reward_points",
    )

    op.drop_column(
        "contents",
        "target",
    )

    op.drop_column(
        "contents",
        "challenge_type",
    )