{
  nix-filter ? null,
  buildNpmPackage,
  backendUrl ? "@backend@",
}:
buildNpmPackage {
  pname = "arkheon-web";
  version = "unstable-2024";

  VITE_BACKEND_URL = backendUrl;

  src = if nix-filter != null
    then nix-filter {
      root = ./src/frontend;
      exclude = [ "node_modules" ];
    }
    else ./src/frontend;

  npmDepsHash = "sha256-PMi2i3Rzu2mZpMxcFIYMGDARiWS3X2Zbk904hZbCiR8=";

  installPhase = ''
    mv dist $out
  '';
}
