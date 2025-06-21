from datetime import datetime

from pydantic import BaseModel, HttpUrl


class Message(BaseModel):
    message: str

    class Config:
        from_attributes = True


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


class PackageDiff(BaseModel):
    new: tuple[list[str | None], int]
    old: tuple[list[str | None], int]


class SizeDiff(BaseModel):
    new: int
    old: int


class DeploymentNavigation(BaseModel):
    prev: int | None
    next: int | None


class DeploymentDiff(BaseModel):
    changed: dict[str, PackageDiff]
    removed: dict[str, tuple[list[str | None], int]]
    added: dict[str, tuple[list[str | None], int]]
    sizes: SizeDiff
    deployment: DeploymentDTO
    machine: str
    navigation: DeploymentNavigation


class WebHookConfig(BaseModel):
    machine: str
    endpoint: HttpUrl
