{
  config,
  pkgs,
  lib,
  utils,
  ...
}:

let
  inherit (lib)
    getExe'
    mapAttrsToList
    mkDefault
    mkEnableOption
    mkIf
    mkMerge
    mkOption
    mkPackageOption
    optional
    optionalString
    ;

  inherit (lib.types)
    attrsOf
    bool
    int
    nullOr
    path
    str
    submodule
    ;

  inherit (utils) escapeSystemdExecArgs;

  cfg = config.services.arkheon;
  hasSSL =
    with config.services.nginx.virtualHosts.${cfg.domain};
    onlySSL || enableSSL || addSSL || forceSSL;
in

{
  options.services.arkheon = {
    enable = mkEnableOption "Arkheon";

    package = mkPackageOption pkgs.python3.pkgs "arkheon" { };

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

      identifier = mkOption {
        type = nullOr str;
        default = null;
        description = ''
          Set the identifier of the machine so as to not rely on the hostname.
        '';
      };
    };

    workers = mkOption {
      type = int;
      default = 4;
      description = ''
        Number of uvicorn workers to spawn.
      '';
    };

    settings = mkOption {
      type = submodule {
        freeformType = attrsOf str;
        options.SQLALCHEMY_DATABASE_URL = mkOption { description = "Database url"; };
      };
      description = "Settings to pass as environment variables";
    };

    secrets = mkOption {
      type = attrsOf path;
      default = { };
      description = ''
        Secrets that will be passed to Arkheon via LoadCredential.
      '';
    };

    domain = mkOption {
      type = str;
      description = "Hostname for reverse proxy config. To configure";
    };

    configureNginx = mkOption {
      type = bool;
      default = true;
      description = ''
        Whether to configure nginx as a reverse proxy for Arkheon.
      '';
    };
  };

  config = mkMerge [
    (mkIf cfg.enable {
      services = {
        arkheon.settings.SQLALCHEMY_DATABASE_URL = mkDefault "sqlite+aiosqlite:///var/lib/arkheon/arkheon.db";

        nginx = mkIf cfg.configureNginx {
          enable = true;
          virtualHosts.${cfg.domain}.locations = {
            "/" = {
              root = pkgs.runCommand "arkheon-frontend" { nativeBuildInputs = [ pkgs.gnugrep ]; } ''
                cp -R ${cfg.package.frontend} $out
                substituteInPlace $(grep -l @backend@ $out/assets/*) --replace-fail @backend@ "http${optionalString hasSSL "s"}://${cfg.domain}/api"
              '';
              tryFiles = "$uri /index.html";
            };

            "/api/".proxyPass = "http://unix:/run/arkheon/.sock";
          };
        };
      };

      systemd.sockets.arkheon = {
        description = "Socket for the Arkheon web server";
        wantedBy = [ "sockets.target" ];

        socketConfig = {
          ListenStream = "/run/arkheon/.sock";
          SocketMode = "600";
          SocketUser = config.services.nginx.user;
        };
      };

      systemd.services.arkheon = {
        environment = cfg.settings;
        path = [ cfg.package.pythonEnv ];

        preStart = ''
          cp --no-preserve=mode,ownership ${cfg.package.alembic-ini} alembic.ini
          alembic upgrade head
        '';

        serviceConfig = {
          User = "arkheon";
          DynamicUser = true;
          ExecStart = escapeSystemdExecArgs [
            (getExe' cfg.package.pythonEnv "gunicorn")
            "--workers"
            cfg.workers
            "--bind"
            "unix:/run/arkheon/.sock"
            "--worker-class"
            "uvicorn.workers.UvicornWorker"
            "arkheon:app"
          ];
          StateDirectory = "arkheon";
          WorkingDirectory = "/var/lib/arkheon";
          ExecReload = "${getExe' pkgs.coreutils "kill"} -s HUP $MAINPID";
          KillMode = "mixed";
          Type = "notify";
          LoadCredential = mapAttrsToList (name: path: "${name}:${path}") cfg.secrets;
        };
        wantedBy = [ "multi-user.target" ];
        after = [ "network.target" ];
      };
    })

    (mkIf cfg.record.enable {
      system.activationScripts.arkheon-record = {
        text = ''
          # Avoid error when the service is first activated
          if [ -d /var/lib/arkheon-record/.canary ]; then
            echo $systemConfig > /var/lib/arkheon-record/.canary
          fi
        '';

        supportsDryActivation = false;
      };

      systemd = {
        services.arkheon-record = {
          description = "Arkheon recording service.";

          wants = [ "network-online.target" ];
          after = [ "network-online.target" ];

          path = [
            pkgs.curl
            pkgs.nettools
            pkgs.nix
          ];

          environment = {
            ARKHEON_OPERATOR = "colmena";
            ARKHEON_URL = cfg.record.url;
          };

          script = ''
            SYSTEM=$(cat /var/lib/arkheon-record/.canary)

            MACHINE=${if cfg.record.identifier != null then cfg.record.identifier else "$(hostname)"}

            TOP_LEVEL=$(nix --extra-experimental-features nix-command path-info "$SYSTEM")

            if [ -f "$CREDENTIALS_DIRECTORY/token" ]; then
              TOKEN=$(cat "$CREDENTIALS_DIRECTORY/token")
            fi

            nix --extra-experimental-features nix-command \
              path-info --closure-size -rsh "$SYSTEM" --json | curl -X POST \
              -H "Content-Type: application/json" \
              -H "X-Token: $TOKEN" \
              -H "X-Operator: $ARKHEON_OPERATOR" \
              -H "X-TopLevel: $TOP_LEVEL" \
              --data @- \
              "$ARKHEON_URL/api/v1/record/$MACHINE"
          '';

          serviceConfig = {
            LoadCredential = optional (cfg.record.tokenFile != null) "token:${cfg.record.tokenFile}";
            RuntimeDirectory = "arkheon-record";
            Restart = "on-failure";
            RestartSec = "5s";
            Type = "oneshot";
          };
        };

        paths.arkheon-record = {
          wantedBy = [ "multi-user.target" ];

          pathConfig = {
            PathModified = "/var/lib/arkheon-record/.canary";
            Unit = "arkheon-record.service";
          };
        };
      };
    })
  ];
}
