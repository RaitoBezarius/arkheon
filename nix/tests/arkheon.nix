# SPDX-FileCopyrightText: 2024 sinavir <sinavir@sinavir.fr>
#
# SPDX-License-Identifier: EUPL-1.2

{ sprinkle }:
{ hostPkgs, ... }:
{
  name = "arkheon";

  nodes.machine = {
    imports = [ sprinkle.output.nixosModule ];

    services.arkheon = {
      enable = true;
      domain = "arkheon";

      package = hostPkgs.arkheon;
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
            "curl -sSfL http://[::1]/api/v1/machines"
        )
  '';
}
