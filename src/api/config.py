import logging
from contextlib import asynccontextmanager
from typing import Annotated, List, Optional

from fastapi import FastAPI
from pydantic import BaseModel, Field, HttpUrl, TypeAdapter
from pydantic_settings import BaseSettings, SettingsConfigDict

from .db import SessionLocal
from .models import Machine as M
from .models import WebHook as W

logger = logging.getLogger(__name__)


class WebHookConfig(BaseModel):
    machine: str
    endpoint: HttpUrl


class Settings(BaseSettings):
    token: Annotated[Optional[str], Field] = None
    webhook_file: Annotated[Optional[str], Field] = None

    model_config = SettingsConfigDict(env_prefix="ARKHEON_")


settings = Settings()


@asynccontextmanager
async def lifespan(_: FastAPI):
    if settings.token is None:
        logger.warn("No token is provided for Arkheon.")

    if settings.webhook_file is None:
        logger.warn(
            "No webhook file declared, notifications on records will be disabled."
        )
    else:
        # Read the webhook file and store the data in the DB
        with open(settings.webhook_file) as fd:
            ws = TypeAdapter(List[WebHookConfig]).validate_json(fd.read())

        logger.info(f"Registering webhooks from {settings.webhook_file}.")
        with SessionLocal() as db:
            for w in ws:
                trigger = db.query(M).filter(M.identifier == w.machine).one()
                db.add(W(trigger=trigger, endpoint=str(w.endpoint)))
                logger.debug(
                    f"Added a webhook for {trigger.identifier} at {w.endpoint}"
                )

            db.commit()

    yield

    with SessionLocal() as db:
        # Delete the registered webhooks
        db.query(W).delete()
        db.commit()
