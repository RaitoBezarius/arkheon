from typing import Union

from sqlalchemy.orm import Session
from fastapi import Depends, FastAPI, HTTPException
from . import crud, models, schemas
from .db import SessionLocal, engine
from .package import closure_paths_to_map

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

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

@app.post("/record/{machine_identifier}")
def record_deployment(machine_identifier: str, closure: list[schemas.StorePathCreate], db: Session = Depends(get_db)):
    deployment = crud.record_deployment(db, machine_identifier, closure)
    return {"message": f"{deployment.id} recorded for machine {deployment.target_machine}"}

@app.get("/compare/{machine_identifier}")
def compare_deployments(left_deployment_id: int, right_deployment_id: int, db: Session = Depends(get_db)):
    left = get_or_404(db, models.Deployment, left_deployment_id)
    right = get_or_404(db, models.Deployment, right_deployment_id)

    left_closure_map = closure_paths_to_map(left.closure)
    right_closure_map = closure_paths_to_map(right.closure)

    left_package_names = set(left_closure_map.keys())
    right_package_names = set(right_closure_map.keys())

    common_package_names = sorted(left_package_names & right_package_names)
    left_only_package_names = sorted(left_package_names - right_package_names)
    right_only_package_names = sorted(right_package_names - left_package_names)

    # Announce version changes.
    package_names_with_changed_versions = []
    for pname in common_package_names:
        if left_closure_map[pname] != right_closure_map[pname]:
            package_names_with_changed_versions.append(pname)

    return {"package_names_with_changed_versions": package_names_with_changed_versions, "old_packages": left_only_package_names, "new_packages": right_only_package_names}
