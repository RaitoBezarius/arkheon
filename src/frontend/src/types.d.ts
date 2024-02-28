type Deployment = {
  id: number;
  created_at: string;
  toplevel: string;
  operator_id: string;
  target_machine_id: string;
};

interface Machine {
  identifier: string;
}

type Versions = [Array<string?>, number];

interface RawDiff {
  added: { [index: string]: Versions };
  removed: { [index: string]: Versions };
  changed: { [index: string]: { old: Versions; new: Versions } };
  sizes: { old: number; new: number };
  deployments?: { old: Deployment?; new: Deployment };
}

interface Diff {
  added: Map<string, Versions>;
  removed: Map<string, Versions>;
  changed: Map<string, { old: Versions; new: Versions }>;
  sizes: { old: number; new: number };
  deployments?: { old: Deployment?; new: Deployment };
}

interface Package {
  name: string;
  versions: Versions;
}

interface PackageDiff {
  name: string;
  old: Versions;
  new: Versions;
}
