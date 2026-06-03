"""create point_settings table

Revision ID: b7e2f4a10c38
Revises: a3f8c2d91b05
Create Date: 2026-05-29 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'b7e2f4a10c38'
down_revision: Union[str, None] = 'a3f8c2d91b05'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


DEFAULT_SETTINGS = [
    {"key": "scan",        "label": "Scan (AI)",  "points": 10, "balance": 0},
    {"key": "kompos",      "label": "Kompos",      "points": 30, "balance": 0},
    {"key": "daur_ulang",  "label": "Daur Ulang",  "points": 25, "balance": 0},
    {"key": "eco_brick",   "label": "Eco Brick",   "points": 35, "balance": 0},
    {"key": "reuse",       "label": "Reuse",       "points": 20, "balance": 0},
    {"key": "bank_sampah", "label": "Bank Sampah", "points": 40, "balance": 1000},
    {"key": "khusus",      "label": "Khusus",      "points": 50, "balance": 0},
]


def upgrade() -> None:
    point_settings = op.create_table(
        "point_settings",
        sa.Column("id",         sa.Integer(),                  primary_key=True, autoincrement=True),
        sa.Column("key",        sa.String(50),  nullable=False, unique=True),
        sa.Column("label",      sa.String(100), nullable=False),
        sa.Column("points",     sa.Integer(),   nullable=False, server_default="0"),
        sa.Column("balance",    sa.Integer(),   nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    op.create_index("ix_point_settings_key", "point_settings", ["key"])

    # Isi data default
    op.bulk_insert(point_settings, DEFAULT_SETTINGS)


def downgrade() -> None:
    op.drop_index("ix_point_settings_key", table_name="point_settings")
    op.drop_table("point_settings")