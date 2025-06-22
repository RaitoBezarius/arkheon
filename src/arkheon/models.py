import datetime
import logging
from typing import List

from sqlalchemy import (
    Column,
    DateTime,
    ForeignKey,
    Integer,
    Table,
    UniqueConstraint,
    func,
    select,
)
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import Mapped, mapped_column, relationship

from arkheon.database import Base

logger = logging.getLogger(__name__)

closures_table = Table(
    "closures",
    Base.metadata,
    Column("store_path_id", Integer, ForeignKey("store_paths.id"), primary_key=True),
    Column("deployment_id", Integer, ForeignKey("deployments.id"), primary_key=True),
    UniqueConstraint(
        "store_path_id", "deployment_id", name="unique_closure_per_deployment"
    ),
)

references_table = Table(
    "references",
    Base.metadata,
    Column("referrer_id", Integer, ForeignKey("store_paths.id"), primary_key=True),
    Column("referenced_id", Integer, ForeignKey("store_paths.id"), primary_key=True),
    UniqueConstraint("referrer_id", "referenced_id", name="unique_dependencies"),
)


class StorePath(Base):
    __tablename__ = "store_paths"

    id: Mapped[int] = mapped_column(primary_key=True)
    path: Mapped[str] = mapped_column(unique=True, index=True)
    closure_size: Mapped[int] = mapped_column()
    nar_size: Mapped[int] = mapped_column()
    deriver: Mapped[str | None] = mapped_column(index=True)
    nar_hash: Mapped[str] = mapped_column(index=True)
    valid: Mapped[bool] = mapped_column()

    # not generic...
    # registration_time

    references: Mapped[List["StorePath"]] = relationship(
        "StorePath",
        secondary=references_table,
        primaryjoin=id == references_table.c.referrer_id,
        secondaryjoin=id == references_table.c.referenced_id,
        back_populates="referrers",
    )
    referrers: Mapped[List["StorePath"]] = relationship(
        "StorePath",
        secondary=references_table,
        primaryjoin=id == references_table.c.referenced_id,
        secondaryjoin=id == references_table.c.referrer_id,
        back_populates="references",
    )

    associated_deployments: Mapped[List["Deployment"]] = relationship(
        secondary=closures_table, back_populates="closure"
    )


class Operator(Base):
    __tablename__ = "operators"

    name: Mapped[str] = mapped_column(primary_key=True)
    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    last_seen: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    deployments: Mapped[List["Deployment"]] = relationship(back_populates="operator")


class Deployment(Base):
    __tablename__ = "deployments"

    id: Mapped[int] = mapped_column(primary_key=True)
    operator_id: Mapped[int] = mapped_column(ForeignKey("operators.name"))
    operator: Mapped[Operator] = relationship(back_populates="deployments")
    target_machine_id: Mapped[int] = mapped_column(ForeignKey("machines.id"))
    target_machine: Mapped["Machine"] = relationship(back_populates="deployments")
    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    closure: Mapped[List[StorePath]] = relationship(
        secondary=closures_table,
        back_populates="associated_deployments",
        cascade="merge",
    )
    toplevel: Mapped[str] = mapped_column(index=True)
    size: Mapped[int] = mapped_column(default=0)


class WebHook(Base):
    __tablename__ = "webhooks"

    id: Mapped[int] = mapped_column(primary_key=True)
    endpoint: Mapped[str] = mapped_column()
    trigger_id: Mapped[int] = mapped_column(ForeignKey("machines.id"))
    trigger: Mapped["Machine"] = relationship(back_populates="webhooks")


class Machine(Base):
    __tablename__ = "machines"

    id: Mapped[int] = mapped_column(primary_key=True)
    identifier: Mapped[str] = mapped_column(unique=True, index=True)
    deployments: Mapped[List[Deployment]] = relationship()
    webhooks: Mapped[List[WebHook]] = relationship()

    def __str__(self):
        return self.identifier
