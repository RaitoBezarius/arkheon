_final: prev: {
  pythonPackagesExtensions = prev.pythonPackagesExtensions ++ [
    (self: super: {
      arkheon = self.callPackage ./packages/arkheon { };
      loadcredential = self.callPackage ./packages/python-modules/loadcredential.nix { };
    })
  ];
}
