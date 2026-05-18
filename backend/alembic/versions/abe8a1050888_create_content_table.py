from alembic import op
import sqlalchemy as sa


revision = 'create_content_table'
down_revision = 'a1b2c3d4e5f6'  # pastikan ini sesuai revision terakhir kamu
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'contents',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('title', sa.String(255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('type', sa.String(50), nullable=False),  # tips, challenge, reward
        sa.Column('status', sa.String(50), nullable=False, server_default=sa.text("'draft'")),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
    )


def downgrade():
    op.drop_table('contents')