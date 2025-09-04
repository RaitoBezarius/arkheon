# SPDX-FileCopyrightText: 2025 Tom Hubrecht <github@mail.hubrecht.ovh>
#
# SPDX-License-Identifier: EUPL-1.2

final: prev: {
  pythonPackagesExtensions = prev.pythonPackagesExtensions ++ [
    (self: _super: {
      arkheon = self.callPackage ./packages/arkheon { };
      loadcredential = self.callPackage ./packages/loadcredential { };
    })
  ];

  arkheon = with final.python3Packages; toPythonApplication arkheon;
}
