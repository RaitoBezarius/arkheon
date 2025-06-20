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

  npmDepsHash = "sha256-scDMTiTqHcLV7ASMCaBA8XT8haLuM8EcmG4k0wUeYYo=";

  env.VITE_BACKEND_URL = "@backend@";

  installPhase = ''
    mv dist $out
  '';
}
