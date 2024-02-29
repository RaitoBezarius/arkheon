const units = Array.of("KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB");

type AbstractFunction = (_: any) => void;

export const get = async (path: string, f: AbstractFunction) =>
  fetch(`${import.meta.env.VITE_BACKEND_URL}/${path}`)
    .then((d) => {
      if (!d.ok) throw new Error(`API returned status ${d.status}`);

      return d.json();
    })
    .then(f)
    .catch((e) => {
      location.replace(`/api-error?error=${e}`);
    });

export const date = (s: string) =>
  new Intl.DateTimeFormat("en-GB", {
    timeStyle: "medium",
    dateStyle: "short",
  }).format(new Date(s));

export const size = (bytes: number): [string, string] => {
  const range = Math.trunc(Math.log2(Math.abs(bytes)) / 10);

  if (range === 0 || bytes === 0) return [`${bytes}`, "B"];

  return [(bytes / Math.pow(1024, range)).toFixed(2), units[range - 1]];
};

export const sortVersions = (versions: Array<string | null>): Version[] => {
  const bag: Map<string, number> = new Map();
  for (const _v of versions) {
    const v = _v === null ? "none" : _v;
    const c = bag.get(v);
    bag.set(v, c === undefined ? 1 : c + 1);
  }

  return Array.from(bag.entries()).map(([v, c]) => {
    return {
      count: c,
      value: v,
    };
  });
};
