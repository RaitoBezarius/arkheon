#!/usr/bin/env bash

# SPDX-FileCopyrightText: 2024 Raito Bezarius <masterancpp@gmail.com>
# SPDX-FileCopyrightText: 2025 Tom Hubrecht <github@mail.hubrecht.ovh>
#
# SPDX-License-Identifier: EUPL-1.2

TOP_LEVEL=$(nix path-info /run/current-system)

nix path-info --closure-size -rsh /run/current-system --json | curl -X POST \
	-H "Content-Type: application/json" \
	-H "X-Operator: $ARKHEON_OPERATOR" \
	-H "X-TopLevel: $TOP_LEVEL" \
	--data @- \
	"http://localhost:8000/api/v1/machine/$(hostname)/deployment"
