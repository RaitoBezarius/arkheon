{
  lib,
  buildNpmPackage,
}:

let
  inherit (lib.fileset)
    fileFilter
    gitTracked
    intersection
    toSource
    ;
in

buildNpmPackage {
  pname = "arkheon-web";
  version = "unstable-2024";

  src = toSource rec {
    root = ../../..;
    fileset = intersection (gitTracked root) (
      fileFilter (file: !file.hasExt "nix") (root + "/src/frontend")
    );
  };

  sourceRoot = "source/src/frontend";

  npmDepsHash = "sha256-PMi2i3Rzu2mZpMxcFIYMGDARiWS3X2Zbk904hZbCiR8=";

  env.VITE_BACKEND_URL = "@backend@";

  installPhase = ''
    mv dist $out
  '';
}
