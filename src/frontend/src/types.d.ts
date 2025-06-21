type Deployment = {
  id: number;
  created_at: string;
  toplevel: string;
  operator_id: string;
  target_machine_id: string;
  size: number;
};

interface Machine {
  identifier: string;
}

interface Version {
  value: string;
  count: number;
}

interface Package {
  name: string;
  size: number;
  versions: Version[];
  previous?: {
    size: number;
    versions: Version[];
  };
}

interface Diff {
  added: Package[];
  removed: Package[];
  changed: Package[];
  deployment: Deployment;
  sizes: { old: number; new: number };
  machine: string;
}

// Raw data coming from the API
type RawVersions = [Array<string | null>, number];

type RawPackages = {
  [index: string]: RawVersions | { old: RawVersions; new: RawVersions };
};

interface RawDiff {
  added: RawPackages;
  removed: RawPackages;
  changed: RawPackages;
  sizes: { old: number; new: number };
  deployment: Deployment;
  machine: string;
  navigation: { prev: number | null; next: number | null };
}
