from typing import Union

from sqlalchemy.orm import Session
from fastapi import Depends, FastAPI
from . import crud, models, schemas
from .db import SessionLocal, engine

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/record/{machine_identifier}")
def record_deployment(machine_identifier: str, closure: list[schemas.StorePathCreate], db: Session = Depends(get_db)):
    deployment = crud.record_deployment(db, machine_identifier, closure)
    return {"message": f"{deployment.id} recorded for machine {deployment.target_machine}"}
