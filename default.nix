{
  sources ? import ./npins,
  pkgs ? import sources.nixpkgs { },
}:

{
  frontend = pkgs.callPackage ./frontend.nix { };

  backend = pkgs.python3.pkgs.callPackage ./backend.nix { };

  tests = import ./tests { inherit sources pkgs; };

  shell = pkgs.mkShell {
    buildInputs = [
      (pkgs.python3.withPackages (
        ps: [
          ps.fastapi
          ps.uvicorn
          ps.sqlalchemy
          ps.pydantic
          ps.pydantic-settings
          ps.httpx
        ]
      ))
      pkgs.jq
      pkgs.nodejs
    ];

    shellHook = ''
      export SQLALCHEMY_DATABASE_URL="sqlite:///$(git rev-parse --show-toplevel)/arkheon.db"
    '';
  };
}
