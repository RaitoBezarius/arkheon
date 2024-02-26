#!/usr/bin/env bash

nix path-info \
	--closure-size \
	-rsh /run/current-system \
	--json | curl -X POST \
	-H "Content-Type: application/json" \
	--data @- "http://localhost:8000/record/$(hostname)?toplevel=$(nix path-info /run/current-system)"
