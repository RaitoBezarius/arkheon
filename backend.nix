{ lib
, buildPythonPackage
, fetchFromGitHub
, hatchling
, pydantic
, fastapi
, uvicorn
, sqlalchemy
}:

buildPythonPackage rec {
  pname = "arkheon";
  version = "unstable-2024-02-27";
  pyproject = true;

  src = ./.;

  nativeBuildInputs = [
    hatchling
  ];

  propagatedBuildInputs =  [
    fastapi
    pydantic
    sqlalchemy
  ];

  meta = with lib; {
    description = "Track your Nix closures over time";
    homepage = "https://github.com/RaitoBezarius/arkheon/";
    license = licenses.eupl12;
    maintainers = with maintainers; [ ];
    mainProgram = "arkheon";
    platforms = platforms.all;
  };
}
