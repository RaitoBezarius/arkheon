self: super: let
in
{
  python3 = super.python3.override {
    packageOverrides = python-self: python-super: {
      arkheon = python-self.callPackage ./backend.nix {};
    };
  };
}
