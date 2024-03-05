import logging
from contextlib import asynccontextmanager
from typing import Annotated, List, Optional

from fastapi import FastAPI
from pydantic import BaseModel, Field, HttpUrl, TypeAdapter
from pydantic_settings import BaseSettings, SettingsConfigDict
from sqlalchemy import delete, insert

from .db import SessionLocal
from .models import WebHook as W


class WebHookConfig(BaseModel):
    machine: str
    endpoint: HttpUrl


class Settings(BaseSettings):
    token: Annotated[Optional[str], Field] = None
    webhook_file: Annotated[Optional[str], Field] = None

    model_config = SettingsConfigDict(env_prefix="ARKHEON_")


@asynccontextmanager
async def lifespan(_: FastAPI):
    settings = Settings()
    db = SessionLocal()

    if settings.token is None:
        logging.warn("No token is provided for Arkheon.")

    if settings.webhook_file is None:
        logging.warn(
            "No webhook file declared, notifications on records will be disabled."
        )
    else:
        # Read the webhook file and store the data in the DB
        with open(settings.webhook_file) as fd:
            ws = TypeAdapter(List[WebHookConfig]).validate_json(fd.read())

        logging.info(f"Registering webhooks from {settings.webhook_file}.")
        for w in ws:
            db.execute(
                insert(W).values({"trigger_id": w.machine, "endpoint": str(w.endpoint)})
            )

    yield

    db.execute(delete(W))
    # TODO: clear config ?
