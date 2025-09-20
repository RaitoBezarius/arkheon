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
        action-validator = sprinkle.input.nix-actions.gitHook { };

        deadnix.settings.edit = true;
        nixfmt-rfc-style.package = nixfmt-rfc-style;
        statix.settings.ignore = [ "**/lon.nix" ];

        eslint.package = eslint;
        prettier.package = prettier;

        commitizen.stages = [ "commit-msg" ];

        reuse = sprinkle.input.nix-reuse.gitHook { };
      };
}
