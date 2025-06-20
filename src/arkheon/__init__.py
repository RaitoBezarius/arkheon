import logging
from contextlib import asynccontextmanager
from typing import Annotated, Optional

import httpx
from fastapi import Depends, FastAPI, Header, HTTPException, Response, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import TypeAdapter
from sqlalchemy import delete
from sqlalchemy.dialects.sqlite import insert
from sqlalchemy.orm import Session

from arkheon.credentials import settings
from arkheon.database import get_db, sessionmanager
from arkheon.models import WebHook
from arkheon.schemas import WebHookConfig

__VERSION__ = "0.1.0"

logger = logging.getLogger(__name__)


def init_app(init_db: bool = True):
    @asynccontextmanager
    async def lifespan(app: FastAPI):
        if settings.TOKEN is None:
            logger.warning("No token is provided for Arkheon.")

        if settings.WEBHOOK_FILE is None:
            logger.warning(
                "No webhook file declared, notifications on records will be disabled."
            )

        if init_db:
            if not settings.DATABASE_URL.startswith("sqlite"):
                raise RuntimeError("The only supported database backend is Sqlite")

            sessionmanager.init(settings.DATABASE_URL)

            if settings.WEBHOOK_FILE is not None:
                with open(settings.WEBHOOK_FILE) as fd:
                    logger.info(f"Registering webhooks from {settings.WEBHOOK_FILE}")

                    async with sessionmanager.session() as db:
                        for webhook in TypeAdapter(list[WebHookConfig]).validate_json(
                            fd.read()
                        ):
                            await db.execute(
                                insert(WebHook)
                                .values(
                                    trigger_id=webhook.machine,
                                    endpoint=str(webhook.endpoint),
                                )
                                .on_conflict_do_nothing()
                            )
                            logger.debug(
                                f"Added webhook {webhook.endpoint} for {webhook.machine}."
                            )

                        await db.commit()

        yield

        if init_db:
            async with sessionmanager.session() as db:
                await db.execute(delete(WebHook))

                await db.commit()

            if sessionmanager._engine is not None:
                await sessionmanager.close()

    server = FastAPI(title="Arkheon server", lifespan=lifespan)

    from arkheon.v1.router import router as v1_router

    server.include_router(v1_router, prefix="/api")

    origins = [
        "http://localhost:3003",
        "http://localhost:5173",
        "http://localhost:8000",
    ]

    server.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    return server


app = init_app()


__all__ = [
    "__VERSION__",
    "app",
]
