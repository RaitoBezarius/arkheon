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

  npmDepsHash = "sha256-J6LyUzAFHfCdI+gW7KqYDDR81/ChwQx1NOxutgv5jjI=";

  env.VITE_BACKEND_URL = "@backend@";

  installPhase = ''
    mv dist $out
  '';
}
