{
  lib,
  buildPythonPackage,
  fetchFromGitHub,
  setuptools,
  wheel,
}:

buildPythonPackage rec {
  pname = "loadcredential";
  version = "1.3";
  pyproject = true;

  src = fetchFromGitHub {
    owner = "Tom-Hubrecht";
    repo = "loadcredential";
    rev = "v${version}";
    hash = "sha256-dv7a7XpFELIPIf2AUWMPHO3LgzsUz4vBCtFk8MeEOZQ=";
  };

  build-system = [
    setuptools
    wheel
  ];

  pythonImportsCheck = [ "loadcredential" ];

  meta = {
    description = "A simple python package to read credentials passed through systemd's LoadCredential, with a fallback on env variables ";
    homepage = "https://github.com/Tom-Hubrecht/loadcredential";
    license = lib.licenses.mit;
  };
}
