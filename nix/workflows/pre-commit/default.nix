# SPDX-FileCopyrightText: 2024 Tom Hubrecht <tom.hubrecht@dgnum.eu>
#
# SPDX-License-Identifier: EUPL-1.2

{ sprinkle }:

let
  inherit (sprinkle.input.nix-actions.lib) nix-shell;

  inherit (sprinkle.output) actions-steps;
in

{
  name = "Run pre-commit on all files";
  on = [
    "push"
    "pull_request"
  ];

  jobs.pre-push = {
    runs-on = "ubuntu-latest";
    steps =
      [
        (actions-steps.checkout { })
        (actions-steps.lix-installer { })
      ]
      ++ builtins.map (stage: {
        name = "Run pre-commit [${stage}] on all files";
        run = nix-shell {
          script = "pre-commit run --all-files --hook-stage ${stage} --show-diff-on-failure";
          shell = "output.shells.pre-commit";
        };
      }) [ "pre-push" ];
  };
}
