_final: prev: {
  pythonPackagesExtensions = prev.pythonPackagesExtensions ++ [
    (self: _super: {
      arkheon = self.callPackage ./packages/arkheon { };
      loadcredential = self.callPackage ./packages/python-modules/loadcredential.nix { };
    })
  ];
}
