"""

Revision ID: a9c836480f93
Revises: e5accbe38c59
Create Date: 2025-06-21 22:49:46.877491

"""

from typing import Sequence, Union

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "a9c836480f93"
down_revision: Union[str, None] = "e5accbe38c59"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.rename_table("store_paths_closures", "closures")
    op.rename_table("store_path_references", "references")


def downgrade() -> None:
    """Downgrade schema."""
    op.rename_table("closures", "store_paths_closures")
    op.rename_table("references", "store_path_references")
