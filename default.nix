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

    npmDepsHash = "sha256-9LdjB51zn2PPEpO2Avg6Imb3s50+IXkpz4LJcBPsuD8=";

    installPhase = ''
      mv dist $out
    '';
  };

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
