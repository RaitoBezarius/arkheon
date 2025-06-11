import logging
from contextlib import asynccontextmanager
from typing import List

from fastapi import FastAPI
from loadcredential import Credentials
from pydantic import BaseModel, HttpUrl, TypeAdapter

from .db import SessionLocal
from .models import Machine as M
from .models import WebHook as W

logger = logging.getLogger(__name__)


credentials = Credentials(env_prefix="ARKHEON_")


class WebHookConfig(BaseModel):
    machine: str
    endpoint: HttpUrl


@asynccontextmanager
async def lifespan(_: FastAPI):
    token = credentials.get("TOKEN")
    webhook_file = credentials.get("WEBHOOK_FILE")

    if token is None:
        logger.warning("No token is provided for Arkheon.")

    if webhook_file is None:
        logger.warning(
            "No webhook file declared, notifications on records will be disabled."
        )
    else:
        # Read the webhook file and store the data in the DB
        with open(webhook_file) as fd:
            ws = TypeAdapter(List[WebHookConfig]).validate_json(fd.read())

        logger.info(f"Registering webhooks from {webhook_file}.")
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
