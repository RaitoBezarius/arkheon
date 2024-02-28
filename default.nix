{
  sources ? import ./npins,
  pkgs ? import sources.nixpkgs { },
}:

{
  nixosModules.arkheon = import ./nix/module.nix;

  frontend = pkgs.buildNpmPackage {
    pname = "arkheon-web";
    version = "unstable-2024";

    src = ./frontend;

    npmDepsHash = "sha256-pTzP0bx++/jglyYBDBirzUsK/2rTTMbagMUwU0eIdm0=";

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
