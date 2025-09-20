# SPDX-FileCopyrightText: 2025 Tom Hubrecht <github@mail.hubrecht.ovh>
#
# SPDX-License-Identifier: EUPL-1.2

{
  sprinkles ? null,
}:

let
  source = import ./lon.nix;

  input = source: {
    git-hooks = import source."git-hooks.nix";

    nixpkgs = import source.nixpkgs {
      config.allowAliases = false;
    };

    nix-actions =
      ((import source.nix-actions { }).override {
        input = _: { inherit (input source) nixpkgs sprinkles; };
      }).output;

    nix-reuse =
      ((import source.nix-reuse { }).override {
        input = _: { inherit (input source) nixpkgs sprinkles; };
      }).output;

    nixos-lib = import (source.nixpkgs + "/nixos/lib") { };

    sprinkles = if sprinkles == null then import source.sprinkles else sprinkles;
  };
in

(input source).sprinkles.new {
  inherit input source;

  output =
    self:
    let
      pkgs = self.input.nixpkgs.extend self.output.overlay;
    in
    {
      nixosModules.default = ./nixos-module/arkheon;
      nixosModule = self.output.nixosModules.default;

      packages.default = pkgs.arkheon;
      package = self.output.packages.default;

      shells = {
        default = pkgs.callPackage ./shells/default { sprinkle = self; };
        pre-commit = pkgs.callPackage ./shells/pre-commit { sprinkle = self; };
      };

      overlays.default = import ./overlay.nix;
      overlay = self.output.overlays.default;

      tests.arkheon = self.input.nixos-lib.runTest {
        imports = [
          (import ./tests/arkheon.nix { sprinkle = self; })
        ];

        hostPkgs = pkgs; # the Nixpkgs package set used outside the VMs
      };

      workflows = {
        pre-commit = import ./workflows/pre-commit { sprinkle = self; };
      };

      src = ../.;

      actions-steps = self.input.nix-actions.lib.steps {
        checkout = {
          defaultVersion = "08c6903cd8c0fde910a37f88322edcfb5dd907a8";
          url = "actions/checkout";
        };

        lix-installer = {
          defaultVersion = "8dc19fbd6451fa106a68ecb2dafeeeb90dff3a29";
          url = "samueldr/lix-gha-installer-action";
        };
      };
    };
}
