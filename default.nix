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

  devShell = pkgs.mkShell {
    buildInputs = [
      (pkgs.python3.withPackages (ps: [ ps.arkheon ] ++ ps.fastapi.optional-dependencies.standard))

      pkgs.jq
      pkgs.nodejs
    ];

    shellHook = ''
      export ARKHEON_DATABASE_URL="sqlite+aiosqlite:///$(git rev-parse --show-toplevel)/arkheon.db"
      export ARKHEON_OPERATOR=$(whoami)
    '';
  };
}
