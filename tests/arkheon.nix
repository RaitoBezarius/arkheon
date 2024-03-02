{ lib, pkgs, ... }: {
  name = "arkheon";

  nodes.machine = { config, pkgs, ... }: {
    imports = [ ../module.nix ];
    nixpkgs.overlays = [
      (import ../overlay.nix)
    ];
    services.arkheon = {
      enable = true;
      domain = "arkheon";
    };
    networking.firewall.allowedTCPPorts = [ 80 ];
    #specialisation.updatedMachine.configuration.environment.systemPackages = [ pkgs.hello ];
  };

  testScript = let
  in ''
    start_all()
    machine.wait_for_unit("arkheon.service")
    machine.wait_for_unit("network.target")

    with subtest("Home screen loads"):
        machine.succeed(
            "curl -sSfL http://[::1]"
        )

    with subtest("API has no error"):
        # Api is slow to initialize. We should rely on systemd-notify stuff but hard to implement
        machine.wait_until_succeeds(
            "curl -sSfL http://[::1]/api/machines"
        )
  '';
}
