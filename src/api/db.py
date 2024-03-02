import os

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker
from sqlalchemy.types import BigInteger

SQLALCHEMY_DATABASE_URL = os.environ.get("SQLALCHEMY_DATABASE_URL", "sqlite:///./mimir.db")
# SQLALCHEMY_DATABASE_URL = "postgresql://user:password@postgresserver/db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    type_annotation_map = {
        int: BigInteger,
    }
