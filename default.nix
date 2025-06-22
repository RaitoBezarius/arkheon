{
  sources ? import ./lon.nix,
  overlay ? import ./nix/overlay.nix,
  pkgs ? import sources.nixpkgs {
    overlays = [ overlay ];
  },
}:

let
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

      ruff = {
        enable = true;
        stages = [ "pre-push" ];
      };

      commitizen.enable = true;
    };
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
    '';
  };
}
