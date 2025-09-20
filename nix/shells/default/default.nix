# SPDX-FileCopyrightText: 2025 Tom Hubrecht <github@mail.hubrecht.ovh>
#
# SPDX-License-Identifier: EUPL-1.2

{
  sprinkle,
  lib,
  mkShellNoCC,

  jq,
  nodejs,
  python3,
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
    "nix-actions"
    "nix-reuse"
  ] (name: import (./.. + "/${name}.nix") { inherit sprinkle; });
in

mkShellNoCC {
  name = "afnix-docs";

  packages = [
    jq
    nodejs
    (python3.withPackages (ps: ps.arkheon.dependencies ++ ps.fastapi.optional-dependencies.standard))
  ] ++ shell-parts.git-hooks.enabledPackages;

  env.ARKHEON_DEBUG = true;

  shellHook = concatMapStringsSep "\n" (getAttr "shellHook") (
    attrValues shell-parts
    ++ [
      {
        shellHook = ''
          export ARKHEON_DATABASE_URL="sqlite+aiosqlite:///${toString sprinkle.output.src}/arkheon.db"
          export ARKHEON_OPERATOR=$(whoami)
        '';
      }
    ]
  );
}
