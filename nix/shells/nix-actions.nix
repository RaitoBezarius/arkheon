# SPDX-FileCopyrightText: 2025 Tom Hubrecht <tom.hubrecht@dgnum.eu>
#
# SPDX-License-Identifier: EUPL-1.2

{ sprinkle }:

sprinkle.input.nix-actions.run {
  inherit (sprinkle.output) src workflows;

  buildCheck = false;
  platform = "github";

  yamlStyle = "|";
}
