# SPDX-FileCopyrightText: 2025 Tom Hubrecht <afnix@mail.hubrecht.ovh>
#
# SPDX-License-Identifier: EUPL-1.2

{ sprinkle }:

let
  inherit (sprinkle.input.nixpkgs)
    eslint
    lib
    nixfmt-rfc-style
    prettier
    ;

  inherit (lib) genAttrs recursiveUpdate;
in

sprinkle.input.git-hooks.run {
  inherit (sprinkle.output) src;

  default_stages = [ "pre-push" ];

  hooks =
    recursiveUpdate
      (genAttrs
        [
          # Nix files
          "statix"
          "deadnix"
          "nixfmt-rfc-style"

          # Python files
          "isort"
          "ruff"
          "black"

          # Typescript files
          "eslint"
          "prettier"

          "commitizen"
        ]
        (_: {
          enable = true;
        })
      )
      {
        statix.settings.ignore = [ "**/lon.nix" ];
        deadnix.settings.edit = true;
        nixfmt-rfc-style.package = nixfmt-rfc-style;

        prettier.package = prettier;
        eslint.package = eslint;

        commitizen.stages = [ "commit-msg" ];

        reuse = sprinkle.input.nix-reuse.output.gitHook { };
      };
}
