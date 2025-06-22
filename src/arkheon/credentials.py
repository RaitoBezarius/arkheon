# SPDX-FileCopyrightText: 2025 Tom Hubrecht <github@mail.hubrecht.ovh>
#
# SPDX-License-Identifier: EUPL-1.2

from typing import Any

from loadcredential import Credentials

credentials = Credentials(env_prefix="ARKHEON_")


class Settings:
    _defaults = {
        "DATABASE_URL": "sqlite+aiosqlite:///./arkheon.db",
        "TOKEN": None,
        "WEBHOOK_FILE": None,
    }

    _cache = dict()

    def _cached(self, name: str) -> Any:
        try:
            return self._cache[name]
        except KeyError:
            if name in self._defaults:
                value = credentials.get(name, self._defaults[name])
            else:
                value = credentials[name]
            self._cache[name] = value

            return value

    def __getattribute__(self, name: str, /) -> Any:
        if name.startswith("_"):
            return super().__getattribute__(name)

        return self._cached(name)


settings = Settings()

__all__ = [
    "settings",
]
