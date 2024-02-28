from datetime import datetime

from pydantic import BaseModel


class StorePathBase(BaseModel):
    path: str

    closureSize: int
    narSize: int

    narHash: str

    valid: bool
    deriver: str | None = None


class StorePathCreate(StorePathBase):
    registrationTime: int
    references: list[str]
    signatures: list[str] = []
    ca: str | None = None


class StorePath(StorePathBase):
    id: int

    class Config:
        from_attributes = True


class DeploymentDTO(BaseModel):
    id: int
    operator_id: str
    target_machine_id: int
    created_at: datetime
    toplevel: str

    class Config:
        from_attributes = True
