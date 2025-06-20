{
  lib,
  buildPythonPackage,
  callPackage,
  formats,

  # build-system
  setuptools,
  wheel,

  # dependencies
  aiosqlite,
  alembic,
  fastapi,
  httpx,
  loadcredential,
  pydantic,
  sqlalchemy,

  # python-env
  python,
}:

let
  inherit (lib.fileset)
    gitTracked
    intersection
    toSource
    unions
    ;

  root = ../../..;
in

buildPythonPackage rec {
  pname = "arkheon";
  version = "unstable-2024-02-27";
  pyproject = true;

  src = toSource {
    inherit root;

    fileset = intersection (gitTracked root) (
      unions (
        builtins.map (path: root + "/${path}") [
          "pyproject.toml"
          "src/arkheon"
          "README.md"
        ]
      )
    );
  };

  build-system = [
    setuptools
    wheel
  ];

  dependencies = [
    aiosqlite
    alembic
    fastapi
    httpx
    loadcredential
    pydantic
    sqlalchemy
  ];

  pythonImportsCheck = [ "arkheon" ];

  passthru = {
    inherit dependencies;

    frontend = callPackage ./frontend.nix { };

    pythonEnv = python.withPackages (ps: [
      ps.arkheon
      ps.gunicorn
      ps.uvicorn
    ]);

    alembic-ini = (formats.ini { }).generate "alembic.ini" {
      alembic = {
        # path to migration scripts.
        script_location = "${toSource {
          root = root + "/src/arkheon/migrations";
          fileset = intersection (gitTracked root) (root + "/src/arkheon/migrations");
        }}";
        version_path_separator = "os";
      };

      loggers.keys = "root,sqlalchemy,alembic";

      handlers.keys = "console";

      formatters.keys = "generic";

      logger_root = {
        level = "WARNING";
        handlers = "console";
        qualname = "";
      };

      logger_sqlalchemy = {
        level = "WARNING";
        handlers = "";
        qualname = "sqlalchemy.engine";
      };

      logger_alembic = {
        level = "INFO";
        handlers = "";
        qualname = "alembic";
      };

      handler_console = {
        class = "StreamHandler";
        args = "(sys.stderr,)";
        level = "NOTSET";
        formatter = "generic";
      };

      formatter_generic = {
        format = "%(levelname)-5.5s [%(name)s] %(message)s";
        datefmt = "%H:%M:%S";
      };
    };
  };

  meta = with lib; {
    description = "Track your Nix closures over time";
    homepage = "https://github.com/RaitoBezarius/arkheon/";
    license = licenses.eupl12;
    maintainers = with maintainers; [
      raitobezarius
      thubrecht
    ];
    mainProgram = "arkheon";
    platforms = platforms.all;
  };
}
