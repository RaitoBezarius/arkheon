import os.path
from pathlib import Path
from typing import Union


class StorePath:
    def __init__(self, path: Union[str, Path]):
        assert str(path).startswith(
            "/nix/store/"
        ), f"Doesn't start with /nix/store/: {str(path)!r}"
        self._path = Path(path)

    def __str__(self) -> str:
        return f"<StorePath: {self._path}>"

    def __hash__(self):
        return hash(self._path)

    def __eq__(self, other):
        return type(other) is StorePath and self._path == other._path

    def path(self) -> Path:
        return self._path

    def to_base_path(self) -> "StorePath":
        return StorePath(os.path.join(*self._path.parts[0:4]))
