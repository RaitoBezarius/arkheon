{
  lib,
  buildPythonPackage,
  callPackage,

  # build-system
  hatchling,

  # dependencies
  fastapi,
  httpx,
  loadcredential,
  pydantic,
  pydantic-settings,
  sqlalchemy,
}:

let
  inherit (lib.fileset)
    fileFilter
    gitTracked
    intersection
    toSource
    ;

  removeFilesets = lib.foldl lib.fileset.difference;
in

buildPythonPackage {
  pname = "arkheon";
  version = "unstable-2024-02-27";
  pyproject = true;

  src = toSource rec {
    root = ../../..;
    fileset =
      removeFilesets (intersection (gitTracked root) (fileFilter (file: !file.hasExt "nix") root))
        [
          (root + "/src/frontend")
          (root + "/tests")
        ];
  };

  nativeBuildInputs = [ hatchling ];

  propagatedBuildInputs = [
    fastapi
    httpx
    loadcredential
    pydantic
    pydantic-settings
    sqlalchemy
  ];

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
