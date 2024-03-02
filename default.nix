{
  sources ? import ./npins,
  pkgs ? import sources.nixpkgs { },
}:

{
  frontend = pkgs.callPackage ./frontend.nix {};

  backend = pkgs.python3.pkgs.callPackage ./backend.nix {};

  tests = import ./tests { inherit sources pkgs; };

  shell = pkgs.mkShell {
    buildInputs = [
      (pkgs.python3.withPackages (
        ps: [
          ps.fastapi
          ps.uvicorn
          ps.sqlalchemy
          ps.pydantic
        ]
      ))
      pkgs.jq
      pkgs.nodejs
    ];
  };
}
