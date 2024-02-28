{
  sources ? import ./npins,
  pkgs ? import sources.nixpkgs { },
  nix-filter ? import sources.nix-filter,
}:

{
  frontend = pkgs.buildNpmPackage {
    pname = "arkheon-web";
    version = "unstable-2024";

    src = nix-filter {
      root = ./src/frontend;

      exclude = [ "node_modules" ];
    };

    npmDepsHash = "sha256-PMi2i3Rzu2mZpMxcFIYMGDARiWS3X2Zbk904hZbCiR8=";

    installPhase = ''
      mv dist $out
    '';
  };

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
