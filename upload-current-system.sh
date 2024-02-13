#!/usr/bin/env bash

nix path-info --closure-size -rsh /run/current-system --json | jq | curl -X POST -H "Content-Type: application/json" --data @- "http://localhost:8000/record/$(hostname)"
