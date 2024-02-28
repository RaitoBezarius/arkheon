{ config, pkgs, lib, modulesPath, ... }:
let
  cfg = config.services.arkheon;
  hasSSL = with cfg.nginx; onlySSL || enableSSL || addSSL || forceSSL;
in
{
  options.services.arkheon = {
    enable = lib.mkEnableOption "Arkheon";
    pythonEnv = lib.mkOption {
      internal = true;
      visible = false;
      type = lib.types.package;
      default = pkgs.python3.withPackages (ps: [
          ps.arkheon
          ps.daphne
          ps.psycopg2
        ]);
      example = lib.literalExpression ''
        pkgs.python3.withPackages (ps: [
          ps.arkheon
          ps.uvicorn
          ps.gunicorn
        ]);
        '';
    };
    port = lib.mkOption {
      type = with lib.types; nullOr port;
      default = 8007;
      description = "Port of the server (will be passed using --bind flag)";
    };
    address = lib.mkOption {
      type = lib.types.str;
      default = "127.0.0.1";
      description = "The address the server will listen on (will be passed using --host flag)";
    };
    settings = lib.mkOption {
      type = with lib.types; submodule {
        freeformType = attrsOf str;
        options.SQLALCHEMY_DATABASE_URL = lib.mkOption {
          description = "Database url";
        };
      };
      description = "Settings to pass as environment variables";
    };
    envFile = lib.mkOption {
      type = with lib.types; nullOr path;
      description = "Environment file to append to settings.";
      default = null;
    };
    domain = lib.mkOption {
      type = lib.types.str;
      description = "Hostname for reverse proxy config. To configure";
    };
    nginx = lib.mkOption {
      type = lib.types.nullOr (lib.types.submodule (
          (import (modulesPath + "/services/web-servers/nginx/vhost-options.nix") { inherit config lib; })
      ));
      example = lib.literalExpression ''
        {
          serverAliases = [
            "arkheon.''${config.networking.domain}"
          ];
          # To enable encryption and let let's encrypt take care of certificate
          forceSSL = true;
          enableACME = true;
        }
      '';
      description = lib.mdDoc ''
        With this option, you can customize an nginx virtual host which already
        has sensible defaults for Arkheon. If enabled, then by default, the
        serverName is ''${domain}, If this is set to null, no nginx virtualHost
        will be configured.
      '';
    };
  };
  config = {
    services.postgresql = lib.mkIf (lib.hasPrefix "postgresql" cfg.settings.SQLALCHEMY_DATABASE_URL) {
      enable = true;
      ensureUsers = [
        {
          name = "arkheon";
          ensureDBOwnership = true;
        }
      ];
      ensureDatabases = [
        "arkheon"
      ];
    };
    services.arkheon = {
      settings.SQLALCHEMY_DATABASE_URL = lib.mkDefault "postgresql+psycopg2:///arkheon?host=/run/postgresql";
      nginx.locations = {
        "/" = {
          root = pkgs.python3.pkgs.arkheon.frontend.override {
              backendUrl = "http${lib.optionalString hasSSL "s"}://${cfg.domain}/api";
          };
          tryFiles = "$uri /index.html";
        };
        "/api/".proxyPass = "http://${cfg.address}:${builtins.toString cfg.port}/";
      };
    };

    systemd.services.arkheon = lib.mkIf cfg.enable {
      environment = cfg.settings;
      path = [ cfg.pythonEnv ];
      script = "daphne arkheon:app -b ${cfg.address} -p ${builtins.toString cfg.port}";
      serviceConfig = {
        User = "arkheon";
        DynamicUser = true;
        EnvironmentFile = lib.optional (cfg.envFile != null) cfg.envFile;
      };
      wantedBy = [ "multi-user.target" ];
      wants = [ "postgresql.target" ];
      after = [ "network.target" "postgresql.service" ];
    };
    services.nginx = lib.mkIf (cfg.nginx != null) {
      enable = true;
      virtualHosts.${cfg.domain} = cfg.nginx;
    };
  };
}
