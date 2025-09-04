# SPDX-FileCopyrightText: 2025 Tom Hubrecht <afnix@mail.hubrecht.ovh>
#
# SPDX-License-Identifier: EUPL-1.2

{ sprinkle }:

sprinkle.input.nix-reuse.output.run {
  defaultLicense = "EUPL-1.2";
  defaultCopyright = "Tom Hubrecht <github@mail.hubrecht.ovh>";

  downloadLicenses = true;

  generatedPaths = [
    ".envrc"
    ".gitignore"
    ".flake8"

    "nix/lon.lock"

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
}
