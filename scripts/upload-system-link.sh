#!/usr/bin/env bash

nix path-info --closure-size -rsh "/nix/var/nix/profiles/system-$1-link" --json | jq | curl -X POST -H "Content-Type: application/json" --data @- "http://localhost:8000/record/$(hostname)"
