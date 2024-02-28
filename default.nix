{
  sources ? import ./npins,
  pkgs ? import sources.nixpkgs { },
  nix-filter ? import sources.nix-filter,
}:

{
  frontend = pkgs.callPackage ./frontend.nix { inherit nix-filter; };

  backend = pkgs.python3.pkgs.callPackage ./backend.nix {};

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
