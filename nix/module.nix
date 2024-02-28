{ config, pkgs, lib, ... }: 
let
  inherit (lib) mkEnableOption mkPackageOption mkOption types mkIf;
  cfg = config.services.arkheon;
  pythonEnv = pkgs.python3.withPackages (
      ps:
      with ps; [
        cfg.package
        daphne
      ]
  );
in
{
  options.services.arkheon = {
    enable = mkEnableOption ''
      arkheon, a deployment recording service for system based on Nix toplevel closures.

      Examples of covered systems: NixOS and Liminix.
    '';

    package = mkPackageOption pkgs "arkheon" { };

    # domain = mkOption { type = types.str; };
    port = mkOption {
      type = types.port;
      default = 8000;
    };
    unixSocket = mkOption {
      type = types.nullOr types.str;
      default = null;
    };
  };

  config = mkIf cfg.enable {
    systemd.services.arkheon = {
      description = "arkheon, a deployment recording service";
      path = [
        pythonEnv
      ];
      wantedBy = [ "multi-user.target" ];
      serviceConfig = {
        Restart = "always";
        StateDirectory = "arkheon";
      };
      script = 
      let
        networking =
          if cfg.unixSocket != null then "-u ${cfg.unixSocket}" else "-b 127.0.0.1 -p ${toString cfg.port}";
      in
      ''
        daphne ${networking} \
          web:app
      '';
    };
  };
}
