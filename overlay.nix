self: super: {
  python3 = super.python3.override {
    packageOverrides = python-self: python-super: {
      arkheon = python-self.callPackage ./backend.nix { };
    };
  };
}
