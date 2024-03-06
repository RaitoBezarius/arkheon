#!/usr/bin/env bash

TOP_LEVEL=$(nix path-info /run/current-system)

nix path-info --closure-size -rsh /run/current-system --json | curl -X POST \
	-H "Content-Type: application/json" \
	-H "X-Operator: $ARKHEON_OPERATOR" \
	-H "X-TopLevel: $TOP_LEVEL" \
	--data @- \
	"http://localhost:8000/record/$(hostname)"
