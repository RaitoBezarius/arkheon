_: {
  name = "arkheon";

  nodes.machine = {
    imports = [ ../nix/module.nix ];
    nixpkgs.overlays = [ (import ../nix/overlay.nix) ];

    services.arkheon = {
      enable = true;
      domain = "arkheon";
    };

    networking.firewall.allowedTCPPorts = [ 80 ];
  };

  testScript = ''
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
