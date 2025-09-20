# SPDX-FileCopyrightText: 2024 Tom Hubrecht <tom.hubrecht@dgnum.eu>
#
# SPDX-License-Identifier: EUPL-1.2

{
  sprinkle,

  lib,
  mkShellNoCC,
}:

let
  inherit (lib)
    attrValues
    concatMapStringsSep
    genAttrs
    getAttr
    ;

  shell-parts = genAttrs [
    "git-hooks"
  ] (name: import (./.. + "/${name}.nix") { inherit sprinkle; });
in

mkShellNoCC {
  name = "arkheon.pre-commit";

  packages = shell-parts.git-hooks.enabledPackages;

  shellHook = concatMapStringsSep "\n" (getAttr "shellHook") (
    attrValues shell-parts ++ [ { shellHook = "unset shellHook"; } ]
  );
}
