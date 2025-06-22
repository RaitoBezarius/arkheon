#!/usr/bin/env bash

# SPDX-FileCopyrightText: 2024 Raito Bezarius <masterancpp@gmail.com>
# SPDX-FileCopyrightText: 2025 Tom Hubrecht <github@mail.hubrecht.ovh>
#
# SPDX-License-Identifier: EUPL-1.2

nix path-info --closure-size -rsh "/nix/var/nix/profiles/system-$1-link" --json | jq | curl -X POST -H "Content-Type: application/json" --data @- "http://localhost:8000/record/$(hostname)"
