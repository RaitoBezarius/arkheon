# SPDX-FileCopyrightText: 2024 sinavir <sinavir@sinavir.fr>
#
# SPDX-License-Identifier: EUPL-1.2

{
  sources ? import ../npins,
  pkgs ? import sources.nixpkgs { },
}:

let
  nixos-lib = import (sources.nixpkgs + "/nixos/lib") { };
in

{
  arkheon = nixos-lib.runTest {
    imports = [ ./arkheon.nix ];
    hostPkgs = pkgs; # the Nixpkgs package set used outside the VMs
  };
}
