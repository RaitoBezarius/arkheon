{
  sources ? import ./npins,
  overlay ? import ./nix/overlay.nix,
  pkgs ? import sources.nixpkgs {
    overlays = [ overlay ];
  },
}:

{
  tests = import ./tests { inherit sources pkgs; };

  overlay = import ./nix/overlay.nix;

  packages = {
    inherit (pkgs.python3.pkgs) arkheon;
  };

  devShell = pkgs.mkShell {
    buildInputs = [
      (pkgs.python3.withPackages (
        ps: ps.arkheon.dependencies ++ ps.fastapi.optional-dependencies.standard
      ))

      pkgs.jq
      pkgs.nodejs
      pkgs.dart-sass
    ];

    env.VITE_BACKEND_URL = "http://localhost:8000/api";

    shellHook = ''
      export ARKHEON_DATABASE_URL="sqlite+aiosqlite:///$(git rev-parse --show-toplevel)/arkheon.db"
      export ARKHEON_OPERATOR=$(whoami)
    '';
  };
}
