# SPDX-FileCopyrightText: 2024 Tom Hubrecht <tom.hubrecht@dgnum.eu>
#
# SPDX-License-Identifier: EUPL-1.2

{ sprinkle }:

let
  inherit (sprinkle.input.nixpkgs.lib) attrNames;

  inherit (sprinkle.output) actions-steps;
in

{
  name = "Run tests";
  on = [ "pull_request" ];

  jobs.tests = {
    runs-on = "ubuntu-latest";
    steps =
      [
        (actions-steps.checkout { })
        (actions-steps.lix-installer { })
      ]
      ++ (map (name: {
        name = "Run the ${name} test";
        run = "nix-build -A output.tests.${name}";
      }) (attrNames sprinkle.output.tests));
  };
}
