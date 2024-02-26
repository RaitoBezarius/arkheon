from sqlalchemy.dialects.sqlite import insert
from sqlalchemy.orm import Session

from . import models, schemas


def create_closure(
    db: Session,
    target: models.Machine,
    store_paths: list[schemas.StorePathCreate],
    toplevel: str,
) -> models.Deployment:
    spaths = {}
    for spath in store_paths:
        spaths[spath.path] = models.StorePath(
            path=spath.path,
            closure_size=spath.closureSize,
            nar_size=spath.narSize,
            deriver=spath.deriver,
            nar_hash=spath.narHash,
            valid=spath.valid,
        )

    for spath in spaths.values():
        db.execute(
            insert(models.StorePath)
            .values(
                {
                    "path": spath.path,
                    "closure_size": spath.closure_size,
                    "nar_size": spath.nar_size,
                    "deriver": spath.deriver,
                    "nar_hash": spath.nar_hash,
                    "valid": spath.valid,
                }
            )
            .on_conflict_do_nothing(index_elements=["path"])
        )

    db.commit()

    closure = {}
    for spath in spaths.values():
        closure[spath.path] = (
            db.query(models.StorePath).filter_by(path=spath.path).one_or_none()
        )
        if closure[spath.path] is None:
            raise ValueError(
                f"{spath.path} was not persisted in the previous transaction"
            )

    # Insert all references.
    for spath in spaths.values():
        for reference in spath.references:
            db.execute(
                insert(models.references_table)
                .values(
                    referrer_id=closure[spath.path].id,
                    referenced_id=closure[reference.path].id,
                )
                .on_conflict_do_nothing()
            )

    # TODO: allow different operators
    op = db.query(models.Operator).filter_by(name="Raito").one_or_none()

    if op is None:
        op = models.Operator(name="Raito")

    d = models.Deployment(
        operator=op,
        closure=list(closure.values()),
        target_machine=target,
        toplevel=toplevel,
    )

    db.add(d)
    db.commit()

    return d


def record_deployment(
    db: Session,
    machine_identifier: str,
    closure: list[schemas.StorePathCreate],
    toplevel: str,
) -> models.Deployment:
    machine = (
        db.query(models.Machine).filter_by(identifier=machine_identifier).one_or_none()
    )

    if machine is None:
        machine = models.Machine(identifier=machine_identifier)
        db.add(machine)

    return create_closure(db, machine, closure, toplevel)


def get_all_deployments(
    db: Session, machine_identifier: str
) -> list[models.Deployment]:
    return list(
        db.query(models.Deployment)
        .join(models.Machine)
        .filter_by(identifier=machine_identifier)
        .order_by(models.Deployment.id.desc())
    )
