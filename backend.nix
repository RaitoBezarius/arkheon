{
  lib,
  buildPythonPackage,
  hatchling,
  pydantic,
  fastapi,
  sqlalchemy,
  httpx,
  callPackage,
}:

let
  removeFilesets = lib.foldl lib.fileset.difference;
in

buildPythonPackage {
  pname = "arkheon";
  version = "unstable-2024-02-27";
  pyproject = true;

  src =
    with lib.fileset;
    toSource {
      root = ./.;
      fileset =
        removeFilesets (intersection (gitTracked ./.) (fileFilter (file: !file.hasExt "nix") ./.))
          [
            ./src/frontend
            ./tests
          ];
    };

  nativeBuildInputs = [ hatchling ];

  propagatedBuildInputs = [
    fastapi
    httpx
    pydantic
    sqlalchemy
  ];

  postPatch = ''
    substituteInPlace src/api/db.py --replace 'connect_args={"check_same_thread": False}' ""
  '';

  passthru.frontend = callPackage ./frontend.nix { };

  meta = with lib; {
    description = "Track your Nix closures over time";
    homepage = "https://github.com/RaitoBezarius/arkheon/";
    license = licenses.eupl12;
    maintainers = with maintainers; [
      raitobezarius
      thubrecht
    ];
    mainProgram = "arkheon";
    platforms = platforms.all;
  };
}
