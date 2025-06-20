from sqlalchemy import select
from sqlalchemy.dialects.sqlite import insert
from sqlalchemy.exc import NoResultFound
from sqlalchemy.ext.asyncio import AsyncSession

from arkheon import models
from arkheon.models import StorePath
from arkheon.schemas import StorePathCreate


async def create_closure(
    db: AsyncSession,
    store_paths: list[StorePathCreate],
    toplevel: str,
) -> dict[str, StorePath]:
    # Create the store paths
    for sp in store_paths:
        # NOTE: There is a high chance that the paths are already present
        #       so if the INSERT fails we skip it
        await db.execute(
            insert(StorePath)
            .values(
                path=sp.path,
                closure_size=sp.closureSize,
                nar_size=sp.narSize,
                deriver=sp.deriver,
                nar_hash=sp.narHash,
                valid=sp.valid,
            )
            .on_conflict_do_nothing(index_elements=["path"])
        )

    await db.commit()

    # Refetch the paths from the database
    try:
        closure = {
            sp.path: (
                await db.execute(select(StorePath).where(StorePath.path == sp.path))
            )
            .scalars()
            .one()
            for sp in store_paths
        }
    except NoResultFound:
        raise RuntimeError(
            f"A path was not persisted in the previous transaction while saving {toplevel}"
        )

    # Register the references
    for sp in store_paths:
        for ref in sp.references:
            await db.execute(
                insert(models.references_table)
                .values(
                    referrer_id=closure[sp.path].id,
                    referenced_id=closure[ref].id,
                )
                .on_conflict_do_nothing()
            )

    await db.commit()

    return closure
