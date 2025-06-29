# SPDX-FileCopyrightText: 2025 Tom Hubrecht <github@mail.hubrecht.ovh>
#
# SPDX-License-Identifier: EUPL-1.2

from sqlalchemy import select
from sqlalchemy.dialects.sqlite import insert
from sqlalchemy.exc import NoResultFound
from sqlalchemy.ext.asyncio import AsyncSession

from arkheon import models
from arkheon.crud.store_path import create_closure
from arkheon.models import Deployment, Machine, Operator
from arkheon.package import closure_paths_to_map
from arkheon.schemas import (
    DeploymentDiff,
    DeploymentDTO,
    DeploymentNavigation,
    PackageDiff,
    SizeDiff,
    StorePathCreate,
)


async def create_deployment(
    db: AsyncSession,
    machine: str,
    closure: list[StorePathCreate],
    toplevel: str,
    operator: str,
) -> Deployment:
    # Ensure that the machine exists
    try:
        machine_obj = (
            (await db.execute(select(Machine).where(Machine.identifier == machine)))
            .scalars()
            .one()
        )
    except NoResultFound:
        machine_obj = (
            (
                await db.execute(
                    insert(Machine).values(identifier=machine).returning(Machine)
                )
            )
            .scalars()
            .one()
        )

    # Ensures that the operator exists
    try:
        (await db.execute(select(Operator.name).where(Operator.name == operator))).one()
    except NoResultFound:
        await db.execute(insert(Operator).values(name=operator))

    paths = await create_closure(db, closure, toplevel)

    # Create the deployment
    deployment_obj = (
        (
            await db.execute(
                insert(Deployment)
                .values(
                    operator_id=operator,
                    target_machine_id=machine_obj.id,
                    toplevel=toplevel,
                    size=paths[toplevel].closure_size,
                )
                .returning(Deployment)
            )
        )
        .scalars()
        .one()
    )

    # Link the closure to its deployment
    for path in paths.values():
        await db.execute(
            insert(models.closures_table).values(
                store_path_id=path.id,
                deployment_id=deployment_obj.id,
            )
        )

    await db.commit()

    # Return the newly created deployment
    return deployment_obj


async def read_deployment_diff(
    db: AsyncSession,
    new: Deployment,
    old: Deployment | None,
    next: int | None,
) -> DeploymentDiff:
    new_pkgs = closure_paths_to_map(await new.awaitable_attrs.closure)
    old_pkgs = (
        dict()
        if old is None
        else closure_paths_to_map(await old.awaitable_attrs.closure)
    )

    new_pnames = set(new_pkgs.keys())
    old_pnames = set(old_pkgs.keys())

    pkgs_added = new_pnames - old_pnames
    pkgs_removed = old_pnames - new_pnames
    pkgs_updated = {
        pname
        for pname in (new_pnames & old_pnames)
        if new_pkgs[pname] != old_pkgs[pname]
    }

    return DeploymentDiff(
        changed={
            pname: PackageDiff(new=new_pkgs[pname], old=old_pkgs[pname])
            for pname in pkgs_updated
        },
        removed={pname: old_pkgs[pname] for pname in pkgs_removed},
        added={pname: new_pkgs[pname] for pname in pkgs_added},
        sizes=SizeDiff(new=new.size, old=(old and old.size) or 0),
        deployment=DeploymentDTO.model_validate(new),
        machine=new.target_machine.identifier,
        navigation=DeploymentNavigation(prev=old and old.id, next=next),
    )
