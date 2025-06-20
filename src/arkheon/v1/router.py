import logging
from typing import Annotated, Any

import httpx
from fastapi import APIRouter, Depends, Header, HTTPException, Response, status
from sqlalchemy import desc, select
from sqlalchemy.exc import NoResultFound
from sqlalchemy.ext.asyncio import AsyncSession

from arkheon.credentials import settings
from arkheon.crud import create_deployment
from arkheon.crud.deployment import read_deployment_diff
from arkheon.database import get_db
from arkheon.models import Deployment, Machine, WebHook
from arkheon.schemas import DeploymentDiff, DeploymentDTO, Message, StorePathCreate

router = APIRouter(prefix="/v1")

logger = logging.getLogger(__name__)

###
# Machine views


@router.get(
    "/machines",
    # response_model=list[Machine],
    tags=["Machine"],
)
async def get_machines(
    db: AsyncSession = Depends(get_db),
) -> Any:
    return [
        {"identifier": m.identifier}
        for m in (
            await db.execute(select(Machine).order_by(Machine.identifier))
        ).scalars()
    ]


@router.get(
    "/machine/{machine}/deployments",
    # response_model=list[Deployment],
    tags=["Machine", "Deployment"],
)
async def get_machine_deployments(
    machine: str,
    db: AsyncSession = Depends(get_db),
) -> Any:
    return [
        DeploymentDTO.model_validate(d)
        for d in (
            await db.execute(
                select(Deployment)
                .join(Machine)
                .where(Machine.identifier == machine)
                .order_by(desc(Deployment.id))
            )
        ).scalars()
    ]


@router.post(
    "/machine/{machine}/deployment",
    response_model=Message,
    tags=["Machine", "Deployment"],
)
async def post_machine_deployment(
    machine: str,
    closure: list[StorePathCreate],
    response: Response,
    x_toplevel: Annotated[str, Header()],
    x_operator: Annotated[str, Header()],
    x_token: Annotated[str | None, Header()] = None,
    db: AsyncSession = Depends(get_db),
) -> Any:
    if settings.TOKEN is not None and x_token != settings.TOKEN:
        response.status_code = status.HTTP_403_FORBIDDEN
        return {"message": "Incorrect token given."}

    last_deployment = (
        await db.execute(
            select(Deployment)
            .join(Machine)
            .where(Machine.identifier == machine)
            .order_by(desc(Deployment.id))
        )
    ).scalar()

    # NOTE: If the toplevel is already the last one, reject the update.
    #       This still allows recording rollbacks as another deployment
    #       will be between the the identical ones.
    if last_deployment is not None and last_deployment.toplevel == x_toplevel:
        response.status_code = status.HTTP_409_CONFLICT
        return {"message": "This system is already the last recorded."}

    deployment = await create_deployment(
        db=db,
        machine=machine,
        closure=closure,
        toplevel=x_toplevel,
        operator=x_operator,
    )

    webhooks = (
        await db.execute(
            select(WebHook).where(WebHook.trigger_id == deployment.target_machine_id)
        )
    ).scalars()

    # Send data to all regitered webhooks
    for webhook in webhooks:
        logger.debug(
            f"Webhook trigger for {deployment.target_machine}: {webhook.endpoint}"
        )
        httpx.post(
            webhook.endpoint,
            data={
                "operator": deployment.operator,
                "machine": machine,
                "deployment_id": deployment.id,
                "closure_size": await deployment.closure_size(db),
                "previous_size": (
                    last_deployment and (await last_deployment.closure_size(db))
                ),
            },
        )

    return {"message": f"{deployment.id} recorded for machine {machine}"}


###
# Deployment views


@router.get(
    "/deployment/{deployment}/diff",
    response_model=DeploymentDiff,
    tags=["Deployment"],
)
async def get_deployment_diff(
    deployment: int,
    diff_from: int | None = None,
    db: AsyncSession = Depends(get_db),
):
    try:
        new = (
            (await db.execute(select(Deployment).where(Deployment.id == deployment)))
            .scalars()
            .one()
        )
    except NoResultFound:
        raise HTTPException(
            status_code=404,
            detail=f"Deployment {deployment} not found",
        )

    if diff_from is not None:
        try:
            old = (
                (await db.execute(select(Deployment).where(Deployment.id == diff_from)))
                .scalars()
                .one()
            )
        except NoResultFound:
            raise HTTPException(
                status_code=404,
                detail=f"Deployment {diff_from} not found",
            )

        if old.target_machine != new.target_machine:
            raise HTTPException(
                status_code=400,
                detail=f"Deployments {deployment} and {diff_from} are not from the same machine",
            )
    else:
        old = (
            (
                await db.execute(
                    select(Deployment)
                    .where(
                        Deployment.id < await new.awaitable_attrs.id,
                        Deployment.target_machine
                        == await new.awaitable_attrs.target_machine,
                    )
                    .order_by(desc(Deployment.created_at))
                )
            )
            .scalars()
            .first()
        )

    return await read_deployment_diff(db, new, old)
