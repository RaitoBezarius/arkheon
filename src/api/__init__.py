import logging
from typing import Annotated, Optional

import httpx
from fastapi import Depends, FastAPI, Header, HTTPException, Response, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from . import crud, models, schemas
from .config import lifespan, settings
from .db import engine, get_db
from .package import closure_paths_to_map
from .schemas import DeploymentDTO

logger = logging.getLogger(__name__)

D = models.Deployment
M = models.Machine
S = models.StorePath

models.Base.metadata.create_all(bind=engine)

app = FastAPI(lifespan=lifespan)

origins = [
    "http://localhost:3003",
    "http://localhost:5173",
    "http://localhost:8000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_or_404(session, model, pk):
    o = session.query(model).filter_by(id=pk).one_or_none()
    if o is None:
        raise HTTPException(status_code=404, detail="Not found")

    return o


def size_from_path(path: str | None, db: Session):
    if path is None:
        return 0

    return db.query(S).where(S.path == path).one().closure_size


def get_diff(current: D, previous: Optional[D], db: Session):
    if previous is not None and current.target_machine_id != previous.target_machine_id:
        raise HTTPException(
            status_code=400, detail="The deployments come from two different machines"
        )

    current_pkgs = closure_paths_to_map(current.closure)
    current_size = size_from_path(current.toplevel, db)

    if previous is None:
        previous_pkgs = dict()
        previous_size = 0
    else:
        previous_pkgs = closure_paths_to_map(previous.closure)
        previous_size = size_from_path(previous.toplevel, db)

    current_pnames = set(current_pkgs.keys())
    previous_pnames = set(previous_pkgs.keys())

    common = current_pnames & previous_pnames
    added = current_pnames - previous_pnames
    removed = previous_pnames - current_pnames

    # Announce version changes.
    changed = set()
    for pname in common:
        if current_pkgs[pname] != previous_pkgs[pname]:
            changed.add(pname)

    return {
        "changed": {
            p: {"old": previous_pkgs[p], "new": current_pkgs[p]} for p in changed
        },
        "removed": {p: previous_pkgs[p] for p in removed},
        "added": {p: current_pkgs[p] for p in added},
        "sizes": {"old": previous_size, "new": current_size},
        "deployment": DeploymentDTO.model_validate(current),
    }


@app.get("/machines")
def get_machines(db: Session = Depends(get_db)):
    return db.query(M).all()


@app.post("/record/{machine}")
def record(
    machine: str,
    closure: list[schemas.StorePathCreate],
    response: Response,
    x_toplevel: Annotated[str, Header()],
    x_operator: Annotated[str, Header()],
    x_token: Annotated[str | None, Header()] = None,
    db: Session = Depends(get_db),
):
    if settings.token is not None and x_token != settings.token:
        response.status_code = status.HTTP_403_FORBIDDEN
        return {"message": "Incorrect token given."}

    last = (
        db.query(D)
        .where(D.target_machine.has(M.identifier == machine))
        .order_by(D.id.desc())
        .first()
    )

    if last is not None and last.toplevel == x_toplevel:
        response.status_code = status.HTTP_409_CONFLICT
        return {"message": "This system has already been recorded."}

    d = crud.record_deployment(db, machine, closure, x_toplevel, x_operator)

    # Send data to all regitered webhooks
    for w in d.target_machine.webhooks:
        logger.debug(f"Webhook trigger for {d.target_machine.identifier}: {w.endpoint}")
        httpx.post(
            w.endpoint,
            data={
                "operator": x_operator,
                "machine": machine,
                "deployment_id": d.id,
                "closure_size": size_from_path(d.toplevel, db),
                "previous_size": size_from_path(last and last.toplevel, db),
            },
        )

    return {"message": f"{d.id} recorded for machine {d.target_machine.identifier}"}


@app.get("/deployments/{machine_identifier}")
def get_deployments(machine_identifier: str, db: Session = Depends(get_db)):
    return crud.get_all_deployments(db, machine_identifier)


@app.get("/diff-latest")
def diff_latest(deployment_id: int, db: Session = Depends(get_db)):
    current = get_or_404(db, D, deployment_id)
    previous = db.query(D).where(D.id < deployment_id).order_by(D.id.desc()).first()

    return get_diff(current, previous, db)


@app.get("/diff")
def compare_deployments(
    left_deployment_id: int, right_deployment_id: int, db: Session = Depends(get_db)
):
    current = get_or_404(db, D, left_deployment_id)
    previous = get_or_404(db, D, right_deployment_id)

    return get_diff(current, previous, db)
