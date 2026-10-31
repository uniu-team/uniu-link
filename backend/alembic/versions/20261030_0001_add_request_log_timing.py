"""add first_token_ms and is_stream to request_logs

Revision ID: 20261030_0001
Revises: 20261013_0001
"""

from alembic import op
import sqlalchemy as sa


revision = "20261030_0001"
down_revision = "20261013_0001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    with op.batch_alter_table("request_logs") as batch_op:
        batch_op.add_column(
            sa.Column("first_token_ms", sa.Float(), nullable=False, server_default="0")
        )
        batch_op.add_column(
            sa.Column(
                "is_stream",
                sa.Boolean(),
                nullable=False,
                server_default=sa.false(),
            )
        )


def downgrade() -> None:
    with op.batch_alter_table("request_logs") as batch_op:
        batch_op.drop_column("is_stream")
        batch_op.drop_column("first_token_ms")
