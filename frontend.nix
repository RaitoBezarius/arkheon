{
  lib,
  buildNpmPackage,
  backendUrl ? "@backend@",
}:

buildNpmPackage {
  pname = "arkheon-web";
  version = "unstable-2024";

  VITE_BACKEND_URL = backendUrl;

  src =
    with lib.fileset;
    toSource {
      root = ./.;
      fileset = intersection (gitTracked ./.) (fileFilter (file: !file.hasExt "nix") ./src/frontend);
    };
  sourceRoot = "source/src/frontend";

  npmDepsHash = "sha256-PMi2i3Rzu2mZpMxcFIYMGDARiWS3X2Zbk904hZbCiR8=";

  installPhase = ''
    mv dist $out
  '';
}
