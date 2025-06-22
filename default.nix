# SPDX-FileCopyrightText: 2025 Tom Hubrecht <github@mail.hubrecht.ovh>
#
# SPDX-License-Identifier: EUPL-1.2

{
  sources ? import ./lon.nix,
  overlay ? import ./nix/overlay.nix,
  pkgs ? import sources.nixpkgs {
    overlays = [ overlay ];
  },
}:

let
  nix-reuse = import sources.nix-reuse { inherit pkgs; };

  git-checks = (import sources."git-hooks.nix").run {
    src = ./.;

    hooks = {
      statix = {
        enable = true;
        stages = [ "pre-push" ];
        settings.ignore = [ "lon.nix" ];
      };

      deadnix = {
        enable = true;
        stages = [ "pre-push" ];
        settings.edit = true;
      };

      nixfmt-rfc-style = {
        enable = true;
        stages = [ "pre-push" ];
        package = pkgs.nixfmt-rfc-style;
      };

      reuse = nix-reuse.hook {
        enable = true;
        stages = [ "pre-push" ];
        package = pkgs.reuse; # git-hooks.nix is lagging on nixpkgs update
      };

      ruff = {
        enable = true;
        stages = [ "pre-push" ];
      };

      commitizen.enable = true;
    };
  };

  reuse = nix-reuse.install {
    defaultLicense = "EUPL-1.2";
    defaultCopyright = "Tom Hubrecht <github@mail.hubrecht.ovh>";

    downloadLicenses = true;

    generatedPaths = [
      ".envrc"
      ".gitignore"
      ".flake8"

      "lon.lock"
      "lon.nix"

      "src/frontend/package-lock.json"
      "src/frontend/package.json"
      "src/frontend/tsconfig.json"
      "src/frontend/tsconfig.node.json"
      "src/frontend/vite.config.ts"

      "src/arkheon/migrations/versions/*.py"
    ];

    annotations = [
      {
        path = [
          "Arkheon.png"
          "src/frontend/public/*"
        ];
        license = "CC-BY-NC-ND-1.0";
      }

      # Bulma: https://github.com/jgthms/bulma
      {
        path = "src/frontend/src/sass/bulma/**";
        license = "MIT";
        copyright = "Jeremy Thomas";
      }

      # Atkinson Hyperlegible: https://www.brailleinstitute.org/freefont/
      {
        path = [
          "src/frontend/src/assets/fonts/AtkinsonHyperlegibleMono-Regular.woff2"
          "src/frontend/src/assets/fonts/AtkinsonHyperlegibleNext-Regular.woff2"
        ];
        license = "OFL-1.1";
        copyright = "2020 Braille Institute of America, Inc.";
      }

      # Alembic: https://github.com/sqlalchemy/alembic
      {
        path = [
          "src/arkheon/alembic.ini"
          "src/arkheon/migrations/env.py"
          "src/arkheon/migrations/script.py.mako"
        ];
        license = "MIT";
        copyright = "2009-2025 Michael Bayer";
      }
    ];
  };
in

{
  tests = import ./tests { inherit sources pkgs; };

  inherit overlay;

  packages = {
    inherit (pkgs.python3.pkgs) arkheon;
  };

  devShell = pkgs.mkShell {
    packages = [
      (pkgs.python3.withPackages (
        ps: ps.arkheon.dependencies ++ ps.fastapi.optional-dependencies.standard
      ))

      pkgs.jq
      pkgs.nodejs
    ] ++ git-checks.enabledPackages;

    env.VITE_BACKEND_URL = "http://localhost:8000/api";

    shellHook = ''
      export ARKHEON_DATABASE_URL="sqlite+aiosqlite:///$(git rev-parse --show-toplevel)/arkheon.db"
      export ARKHEON_OPERATOR=$(whoami)
      ${git-checks.shellHook}
      ${reuse.shellHook}
    '';
  };
}
