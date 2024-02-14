{ sources ? import ./npins, pkgs ? import sources.nixpkgs { } }:
{
  shell = pkgs.mkShell {
    buildInputs = with pkgs; [
      (python3.withPackages (ps: [
        ps.fastapi
        ps.uvicorn
        ps.sqlalchemy
        ps.pydantic
      ]))
      jq
    ];
  };
}
