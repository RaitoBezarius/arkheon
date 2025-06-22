# SPDX-FileCopyrightText: 2024 Raito Bezarius <masterancpp@gmail.com>
# SPDX-FileCopyrightText: 2025 Tom Hubrecht <github@mail.hubrecht.ovh>
#
# SPDX-License-Identifier: EUPL-1.2

# From nvd, Apache License 2.0.
import re
from typing import Dict, List, Optional, Tuple, Union

from . import models
from .store import StorePath

SEL_SELECTED = "*"
SEL_UNSELECTED = "."
SEL_NEWLY_SELECTED = "+"
SEL_NEWLY_UNSELECTED = "-"
# There's no way to reach these selection states currently, since manifests are
# always computed.
SEL_LEFT_ONLY_SELECTED = "L"
SEL_LEFT_ONLY_UNSELECTED = "l"
SEL_RIGHT_ONLY_SELECTED = "R"
SEL_RIGHT_ONLY_UNSELECTED = "r"
SEL_NO_MANIFESTS = ""

# For the version comparison algorithm, see:
# https://nixos.org/manual/nix/stable/#ssec-version-comparisons


class VersionChunk:
    def __init__(self, chunk_value: Union[int, str]):
        assert isinstance(chunk_value, int) or isinstance(chunk_value, str)
        self._chunk_value = chunk_value

    def __str__(self):
        return repr(self._chunk_value)

    def __lt__(self, other):
        if not isinstance(other, VersionChunk):
            return NotImplemented

        x = self._chunk_value
        y = other._chunk_value
        x_int = isinstance(x, int)
        y_int = isinstance(y, int)
        if x_int and y_int:
            return x < y
        elif (x == "" and y_int) or x == "pre":
            return True
        elif (x_int and y == "") or y == "pre":
            return False
        elif x_int:  # y is a string
            return False
        elif y_int:  # x is a string
            return True
        else:  # both are strings
            return x < y

    def __eq__(self, other):
        if not isinstance(other, VersionChunk):
            return NotImplemented

        return self._chunk_value == other._chunk_value


class Version:
    def __init__(self, text: Optional[str]):
        if text is None:
            text = ""

        self._text = text

        self._chunks: List[VersionChunk] = []
        while text != "":
            first_char = text[0]
            if first_char.isdigit():
                last = 0
                while last + 1 < len(text) and text[last + 1].isdigit():
                    last += 1
                self._chunks.append(VersionChunk(int(text[0 : last + 1])))
                text = text[last + 1 :]
            elif first_char.isalpha():
                last = 0
                while last + 1 < len(text) and text[last + 1].isalpha():
                    last += 1
                self._chunks.append(VersionChunk(text[0 : last + 1]))
                text = text[last + 1 :]
            else:
                last = 0
                while (
                    last + 1 < len(text)
                    and not text[last + 1].isdigit()
                    and not text[last + 1].isalpha()
                ):
                    last += 1
                # No chunk append here, only care about alnum runs.
                text = text[last + 1 :]

    def __eq__(self, other):
        if not isinstance(other, Version):
            return NotImplemented
        return self._chunks == other._chunks

    def __lt__(self, other):
        if not isinstance(other, Version):
            return NotImplemented
        return self._chunks < other._chunks


class Package:
    def __init__(self, *, pname: str, version: Version, store_path: StorePath):
        assert isinstance(pname, str), f"Not a string: {pname!r}"
        assert isinstance(version, Version), f"Not a Version: {version!r}"
        assert isinstance(store_path, StorePath), f"Not a StorePath: {store_path!r}"
        self._pname = pname
        self._version = version
        self._store_path = store_path

    def pname(self) -> str:
        return self._pname

    def version(self) -> Version:
        return self._version

    def store_path(self) -> StorePath:
        return self._store_path


class PackageManifest:
    def __init__(self, packages: List[Package]):
        assert isinstance(packages, List)
        assert all(isinstance(package, Package) for package in packages)

        self._packages = packages

        self._packages_by_pname: Dict[str, List[Package]] = {}
        for entry in packages:
            self._packages_by_pname.setdefault(entry.pname(), []).append(entry)

    # @staticmethod
    # def parse_tree(root: Path) -> "PackageManifest":
    #     direct_deps_str: str = subprocess.run(
    #         [make_nix_bin_path("nix-store"), "--query", "--references", str(root)],
    #         stdout=PIPE,
    #         text=True,
    #         check=True,
    #     ).stdout.rstrip("\n")
    #
    #     direct_deps: List[str] = direct_deps_str.split("\n") if direct_deps_str else []
    #
    #     packages = []
    #     for dep_path in direct_deps:
    #         pname, version = parse_pname_version(dep_path)
    #         packages.append(
    #             Package(
    #                 pname=pname,
    #                 version=Version(version),
    #                 store_path=StorePath(dep_path),
    #             )
    #         )
    #
    #     return PackageManifest(packages)

    def contains_pname(self, pname: str) -> bool:
        return pname in self._packages_by_pname

    def all_pnames(self):
        return self._packages_by_pname.keys()


class PackageManifestPair:
    def __init__(
        self,
        left_manifest: Optional[PackageManifest],
        right_manifest: Optional[PackageManifest],
    ):
        assert left_manifest is None or isinstance(left_manifest, PackageManifest)
        assert right_manifest is None or isinstance(right_manifest, PackageManifest)
        self._left_manifest = left_manifest
        self._right_manifest = right_manifest

    def get_left_manifest(self) -> Optional[PackageManifest]:
        return self._left_manifest

    def get_right_manifest(self) -> Optional[PackageManifest]:
        return self._right_manifest

    def get_selection_state(self, pname: str) -> str:
        left_manifest = self._left_manifest
        right_manifest = self._right_manifest

        if left_manifest is not None and right_manifest is not None:
            in_left_manifest = left_manifest.contains_pname(pname)
            in_right_manifest = right_manifest.contains_pname(pname)
            selection_state_str = [
                SEL_UNSELECTED,
                SEL_NEWLY_UNSELECTED,
                SEL_NEWLY_SELECTED,
                SEL_SELECTED,
            ][int(in_left_manifest) + 2 * int(in_right_manifest)]
        elif left_manifest is not None:
            in_left_manifest = left_manifest.contains_pname(pname)
            selection_state_str = [
                SEL_LEFT_ONLY_UNSELECTED,
                SEL_LEFT_ONLY_SELECTED,
            ][int(in_left_manifest)]
        elif right_manifest is not None:
            in_right_manifest = right_manifest.contains_pname(pname)
            selection_state_str = [
                SEL_RIGHT_ONLY_UNSELECTED,
                SEL_RIGHT_ONLY_SELECTED,
            ][int(in_right_manifest)]
        else:
            selection_state_str = SEL_NO_MANIFESTS

        return selection_state_str

    def is_selection_state_changed(self, pname: str) -> bool:
        in_left_manifest = (
            self._left_manifest is not None
            and self._left_manifest.contains_pname(pname)
        )
        in_right_manifest = (
            self._right_manifest is not None
            and self._right_manifest.contains_pname(pname)
        )
        return in_left_manifest != in_right_manifest


NIX_STORE_PATH_REGEX = re.compile(r"^/nix/store/[a-z0-9]+-(.+?)(-([0-9].*?))?(\.drv)?$")


def parse_pname_version(path: str) -> Tuple[str, str]:
    base_path = str(StorePath(path).to_base_path().path())

    match = NIX_STORE_PATH_REGEX.search(base_path)
    assert match is not None, f"Couldn't parse path: {path}"

    pname = match.group(1)
    version = match.group(3)

    return pname, version


def closure_paths_to_map(
    paths: List[models.StorePath],
) -> dict[str, tuple[list[str | None], int]]:
    result = {}

    for spath in paths:
        name, version = parse_pname_version(spath.path)
        if name not in result:
            result[name] = [[version], spath.nar_size]
        else:
            result[name][0].append(version)
            result[name][1] += spath.nar_size

    for version_list, _ in result.values():
        version_list.sort(key=lambda ver: ver or "")

    return result
