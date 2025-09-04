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
  inherit (lib) concatMapStringsSep getAttr;

  git-hooks = import ../git-hooks.nix { inherit sprinkle; };
  # nix-actions = import ../nix-actions.nix { inherit sprinkle; };
  nix-reuse = import ../nix-reuse.nix { inherit sprinkle; };
in

mkShellNoCC {
  name = "afnix-docs";

  packages = [
    jq
    nodejs
    (python3.withPackages (ps: ps.arkheon.dependencies ++ ps.fastapi.optional-dependencies.standard))
  ]
  ++ git-hooks.enabledPackages;

  env.ARKHEON_DEBUG = true;

  shellHook = concatMapStringsSep "\n" (getAttr "shellHook") [
    {
      shellHook = ''
        export ARKHEON_DATABASE_URL="sqlite+aiosqlite:///${toString sprinkle.output.src}/arkheon.db"
        export ARKHEON_OPERATOR=$(whoami)
      '';
    }
    git-hooks
    nix-reuse
    # nix-actions
  ];
}
