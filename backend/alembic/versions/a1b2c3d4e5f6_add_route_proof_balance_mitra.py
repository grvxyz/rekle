"""add route proof balance verified mitra balance_user

Revision ID: a1b2c3d4e5f6
Revises: d5d02d5944e0
Create Date: 2026-05-18 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, Sequence[str], None] = 'd5d02d5944e0'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:

    # ── 1. actions: kolom baru ─────────────────────────────
    op.add_column('actions',
        sa.Column('route', sa.String(length=50), nullable=True)
    )
    op.add_column('actions',
        sa.Column('proof_image_path', sa.String(length=500), nullable=True)
    )
    op.add_column('actions',
        sa.Column('balance_earned', sa.Integer(), nullable=False, server_default='0')
    )
    op.add_column('actions',
        sa.Column('verified_by', sa.Integer(), nullable=True)
    )
    op.add_column('actions',
        sa.Column('verified_at', sa.DateTime(timezone=True), nullable=True)
    )
    op.create_foreign_key(
        'actions_verified_by_fkey',
        'actions', 'users',
        ['verified_by'], ['id'],
        ondelete='SET NULL',
    )

    # Status lama "confirmed" → "approved" agar konsisten
    op.execute("UPDATE actions SET status = 'approved' WHERE status = 'confirmed'")

    # Data lama tidak punya route → isi default "mandiri"
    op.execute("UPDATE actions SET route = 'mandiri' WHERE route IS NULL")

    # ── 2. users: tambah kolom balance ────────────────────
    op.add_column('users',
        sa.Column('balance', sa.Integer(), nullable=False, server_default='0')
    )

    # ── 3. mitras: buat tabel baru ────────────────────────
    op.create_table(
        'mitras',
        sa.Column('id',             sa.Integer(),          autoincrement=True, nullable=False),
        sa.Column('name',           sa.String(length=200), nullable=False),
        sa.Column('description',    sa.Text(),             nullable=True),
        sa.Column('phone',          sa.String(length=50),  nullable=True),
        sa.Column('email',          sa.String(length=255), nullable=True),
        sa.Column('website',        sa.String(length=500), nullable=True),
        sa.Column('address',        sa.Text(),             nullable=True),
        sa.Column('city',           sa.String(length=100), nullable=True),
        sa.Column('latitude',       sa.Float(),            nullable=True),
        sa.Column('longitude',      sa.Float(),            nullable=True),
        sa.Column('accepted_waste', sa.Text(),             nullable=True),
        sa.Column('mitra_type',     sa.String(length=50),  nullable=False, server_default='bank_sampah'),
        sa.Column('is_active',      sa.Boolean(),          nullable=False, server_default='true'),
        sa.Column('created_at',     sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at',     sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_mitras_id'),   'mitras', ['id'],   unique=False)
    op.create_index(op.f('ix_mitras_city'), 'mitras', ['city'], unique=False)

    # ── 4. user_badges: perbaiki primary key ──────────────
    # Migration awal pakai PK (user_id, badge_id) — composite tanpa kolom id.
    # Model SQLAlchemy terbaru butuh kolom id tersendiri + unique (user_id, badge_id).
    # Cek apakah kolom id sudah ada; kalau belum, tambahkan.
    op.execute("""
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.columns
                WHERE table_name = 'user_badges' AND column_name = 'id'
            ) THEN
                ALTER TABLE user_badges ADD COLUMN id SERIAL;
                ALTER TABLE user_badges DROP CONSTRAINT IF EXISTS user_badges_pkey;
                ALTER TABLE user_badges ADD PRIMARY KEY (id);
            END IF;
        END
        $$;
    """)

    op.execute("""
        ALTER TABLE user_badges
            DROP CONSTRAINT IF EXISTS user_badges_user_id_badge_id_key;
        ALTER TABLE user_badges
            ADD CONSTRAINT user_badges_user_id_badge_id_key UNIQUE (user_id, badge_id);
    """)

    op.execute("""
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.columns
                WHERE table_name = 'user_badges' AND column_name = 'created_at'
            ) THEN
                ALTER TABLE user_badges
                    ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
                    ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL;
            END IF;
        END
        $$;
    """)


def downgrade() -> None:

    # ── 4. user_badges: rollback ──────────────────────────
    op.execute("""
        ALTER TABLE user_badges
            DROP CONSTRAINT IF EXISTS user_badges_user_id_badge_id_key;
    """)

    # ── 3. mitras: drop tabel ─────────────────────────────
    op.drop_index(op.f('ix_mitras_city'), table_name='mitras')
    op.drop_index(op.f('ix_mitras_id'),   table_name='mitras')
    op.drop_table('mitras')

    # ── 2. users: hapus kolom balance ─────────────────────
    op.drop_column('users', 'balance')

    # ── 1. actions: hapus kolom baru ──────────────────────
    op.drop_constraint('actions_verified_by_fkey', 'actions', type_='foreignkey')
    op.drop_column('actions', 'verified_at')
    op.drop_column('actions', 'verified_by')
    op.drop_column('actions', 'balance_earned')
    op.drop_column('actions', 'proof_image_path')
    op.drop_column('actions', 'route')