from fastapi import Depends, FastAPI, HTTPException, Response, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from . import crud, models, schemas
from .db import SessionLocal, engine
from .package import closure_paths_to_map

D = models.Deployment
M = models.Machine

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

origins = [
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


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_or_404(session, model, pk):
    o = session.query(model).filter_by(id=pk).one_or_none()
    if o is None:
        raise HTTPException(status_code=404, detail="Not found")

    return o


@app.get("/machines")
def get_machines(db: Session = Depends(get_db)):
    return db.query(M).all()


@app.post("/record/{machine_identifier}")
def record_deployment(
    machine_identifier: str,
    closure: list[schemas.StorePathCreate],
    toplevel: str,
    response: Response,
    db: Session = Depends(get_db),
):
    if db.query(D).filter_by(toplevel=toplevel).count():
        response.status_code = status.HTTP_409_CONFLICT
        return {"message": "This system has already been recorded."}

    deployment = crud.record_deployment(db, machine_identifier, closure, toplevel)
    return {
        "message": f"{deployment.id} recorded for machine {deployment.target_machine}"
    }


@app.get("/deployments/{machine_identifier}")
def get_deployments(machine_identifier: str, db: Session = Depends(get_db)):
    return crud.get_all_deployments(db, machine_identifier)


@app.get("/diff-latest/{machine_identifier}")
def compare_with_previous(deployment_id: int, db: Session = Depends(get_db)):
    current = get_or_404(db, D, deployment_id)
    previous = db.query(D).where(D.id < deployment_id).one_or_none()

    current_pkgs = closure_paths_to_map(current.closure)

    previous_pkgs = (
        dict() if previous is None else closure_paths_to_map(previous.closure)
    )

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
    }


#
#
# @app.get("/diff/{machine_identifier}")
# def compare_deployments(
#     left_deployment_id: int, right_deployment_id: int, db: Session = Depends(get_db)
# ):
#     left = get_or_404(db, models.Deployment, left_deployment_id)
#     right = get_or_404(db, models.Deployment, right_deployment_id)
#
#     left_closure_map = closure_paths_to_map(left.closure)
#     right_closure_map = closure_paths_to_map(right.closure)
#
#     left_package_names = set(left_closure_map.keys())
#     right_package_names = set(right_closure_map.keys())
#
#     common_package_names = sorted(left_package_names & right_package_names)
#     left_only_package_names = sorted(left_package_names - right_package_names)
#     right_only_package_names = sorted(right_package_names - left_package_names)
#
#     # Announce version changes.
#     package_names_with_changed_versions = []
#     for pname in common_package_names:
#         if left_closure_map[pname] != right_closure_map[pname]:
#             package_names_with_changed_versions.append(pname)
#
#     return {
#         "changed": package_names_with_changed_versions,
#         "removed": left_only_package_names,
#         "added": right_only_package_names,
#     }
