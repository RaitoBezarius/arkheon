from sqlalchemy.orm import Session
from sqlalchemy.dialects.sqlite import insert

from . import models, schemas

def create_closure(db: Session, target: models.Machine, store_paths: list[schemas.StorePathCreate]) -> models.Deployment:
    spaths = {}
    for spath in store_paths:
        spaths[spath.path] = models.StorePath(
            path=spath.path,
            closure_size=spath.closureSize,
            nar_size=spath.narSize,
            deriver=spath.deriver,
            nar_hash=spath.narHash,
            valid=spath.valid
        )

    for spath in store_paths:
        for reference in spath.references:
            if reference not in spaths:
                raise RuntimeError(f'{reference} is not present in this upload, invalid closure!')

            spaths[spath.path].references.append(spaths[reference])

    closure = list(spaths.values())
    op = db.query(models.Operator).filter_by(name="Raito").one_or_none()
    if op is None:
        op = models.Operator(
            name="Raito"
        )
    d = models.Deployment(
        operator=op,
        closure=closure,
        target_machine=target
    )

    for spath in spaths.values():
        db.execute(insert(models.StorePath).values({
            "path": spath.path,
            "closure_size": spath.closure_size,
            "nar_size": spath.nar_size,
            "deriver": spath.deriver,
            "nar_hash": spath.nar_hash,
            "valid": spath.valid
        }).on_conflict_do_nothing(index_elements=['path']))

    db.add(d)
    db.commit()

    return d

def enroll_machine(db: Session, identifier: str, initial_closure: list[schemas.StorePathCreate]) -> models.Deployment:
    m = models.Machine(
        identifier=identifier
    )
    db.add(m)

    return create_closure(db, m, initial_closure)

def record_deployment(db: Session, machine_identifier: str, closure: list[schemas.StorePathCreate]) -> models.Deployment:
    machine = db.query(models.Machine).filter_by(identifier=machine_identifier).one_or_none()

    if machine:
        return create_closure(db, machine, closure)
    else:
        return enroll_machine(db, machine_identifier, closure)

