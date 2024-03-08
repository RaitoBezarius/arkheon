{
  config,
  pkgs,
  lib,
  modulesPath,
  ...
}:

let
  inherit (lib)
    getExe
    literalExpression
    mkDefault
    mkEnableOption
    mkIf
    mkMerge
    mkOption
    optional
    optionalString
    ;

  inherit (lib.types)
    attrsOf
    nullOr
    package
    path
    port
    str
    submodule
    ;

  cfg = config.services.arkheon;
  hasSSL = with cfg.nginx; onlySSL || enableSSL || addSSL || forceSSL;
in

{
  options.services.arkheon = {
    enable = mkEnableOption "Arkheon";

    record = {
      enable = mkEnableOption "Arkheon recording of deployments.";

      tokenFile = mkOption {
        type = nullOr path;
        default = null;
        description = ''
          Path to a file containing the token used for authorized records post.
        '';
      };

      url = mkOption {
        type = str;
        description = "URL of the Arkheon server.";
        example = "http://127.0.0.1:8000";
      };
    };

    pythonEnv = mkOption {
      internal = true;
      visible = false;
      type = package;
      default = pkgs.python3.withPackages (ps: [
        ps.arkheon
        ps.daphne
        ps.psycopg2
      ]);

      example = literalExpression ''
        pkgs.python3.withPackages (ps: [
          ps.arkheon
          ps.uvicorn
          ps.gunicorn
        ]);
      '';
    };

    port = mkOption {
      type = nullOr port;
      default = 8007;
      description = "Port of the server (will be passed using --bind flag)";
    };

    address = mkOption {
      type = str;
      default = "127.0.0.1";
      description = "The address the server will listen on (will be passed using --host flag)";
    };

    settings = mkOption {
      type =

        submodule {
          freeformType = attrsOf str;
          options.SQLALCHEMY_DATABASE_URL = mkOption { description = "Database url"; };
        };
      description = "Settings to pass as environment variables";
    };

    envFile = mkOption {
      type = nullOr path;
      description = "Environment file to append to settings.";
      default = null;
    };

    domain = mkOption {
      type = str;
      description = "Hostname for reverse proxy config. To configure";
    };

    nginx = mkOption {
      type = nullOr (
        submodule (
          import (modulesPath + "/services/web-servers/nginx/vhost-options.nix") { inherit config lib; }
        )
      );
      example = literalExpression ''
        {
          serverAliases = [
            "arkheon.''${config.networking.domain}"
          ];
          # To enable encryption and let let's encrypt take care of certificate
          forceSSL = true;
          enableACME = true;
        }
      '';
      description = ''
        With this option, you can customize an nginx virtual host which already
        has sensible defaults for Arkheon. If enabled, then by default, the
        serverName is ''${domain}, If this is set to null, no nginx virtualHost
        will be configured.
      '';
    };
  };

  config = mkMerge [
    (mkIf cfg.enable {
      services = {
        postgresql = mkIf (lib.hasPrefix "postgresql" cfg.settings.SQLALCHEMY_DATABASE_URL) {
          enable = true;
          ensureUsers = [
            {
              name = "arkheon";
              ensureDBOwnership = true;
            }
          ];
          ensureDatabases = [ "arkheon" ];
        };

        arkheon = {
          settings.SQLALCHEMY_DATABASE_URL = mkDefault "postgresql+psycopg2:///arkheon?host=/run/postgresql";

          nginx.locations = {
            "/" = {
              root = pkgs.python3.pkgs.arkheon.frontend.override {
                backendUrl = "http${optionalString hasSSL "s"}://${cfg.domain}/api";
              };
              tryFiles = "$uri /index.html";
            };
            "/api/".proxyPass = "http://${cfg.address}:${builtins.toString cfg.port}/";
          };
        };

        nginx = mkIf (cfg.nginx != null) {
          enable = true;
          virtualHosts.${cfg.domain} = cfg.nginx;
        };
      };

      systemd.services.arkheon = {
        environment = cfg.settings;
        path = [ cfg.pythonEnv ];
        script = "daphne arkheon:app -b ${cfg.address} -p ${builtins.toString cfg.port}";
        serviceConfig = {
          User = "arkheon";
          DynamicUser = true;
          EnvironmentFile = optional (cfg.envFile != null) cfg.envFile;
        };
        wantedBy = [ "multi-user.target" ];
        wants = [ "postgresql.target" ];
        after = [
          "network.target"
          "postgresql.service"
        ];
      };
    })

    (mkIf cfg.record.enable {
      system.activationScripts.arkheon-record = {
        text = getExe (
          pkgs.writeShellApplication {
            name = "arkheon-record";
            runtimeInputs = [
              pkgs.curl
              pkgs.nix
            ];
            # TODO: Find a way to leak the real operator
            # runtimeEnv.ARKHEON_OPERATOR = "colmena";

            text = ''
              ARKHEON_OPERATOR="colmena"

              TOP_LEVEL=$(nix --extra-experimental-features nix-command path-info /run/current-system)
              TOKEN=${optionalString (cfg.record.tokenFile != null) "$(cat ${cfg.record.tokenFile})"}

              nix --extra-experimental-features nix-command \
                path-info --closure-size -rsh /run/current-system --json | curl -X POST \
              	-H "Content-Type: application/json" \
              	-H "X-Token: $TOKEN" \
              	-H "X-Operator: $ARKHEON_OPERATOR" \
              	-H "X-TopLevel: $TOP_LEVEL" \
              	--data @- \
              	"${cfg.record.url}/record/$(hostname)"
            '';
          }
        );
        supportsDryActivation = false;
      };
    })
  ];
}
