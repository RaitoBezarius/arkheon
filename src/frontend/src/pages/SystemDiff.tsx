import { Show, createEffect, createSignal } from "solid-js";
import { useParams } from "@solidjs/router";
import { date, get, sortVersions } from "../utils";
import { Size } from "../components/Size";
import { PackageList } from "../models/PackageList";
import { URLS } from "../urls";

export default function Diff() {
  const [diff, setDiff] = createSignal<Diff>();

  const params = useParams();

  const mkPackages = (_pkgs: RawPackages): Package[] => {
    let pkgs: Package[] = [];

    for (const [name, v] of Object.entries(_pkgs)) {
      if (Array.isArray(v)) {
        // The package is simple
        const [vs, s] = v;

        pkgs.push({ name: name, size: s, versions: sortVersions(vs) });
      } else {
        // The package is actually a diff
        const [nv, ns] = v.new;
        const [ov, os] = v.old;

        pkgs.push({
          name: name,
          size: ns,
          versions: sortVersions(nv),
          previous: { size: os, versions: sortVersions(ov) },
        });
      }
    }

    return pkgs;
  };

  createEffect(() => {
    get(
      URLS.get_deployment_diff,
      (d: RawDiff) => {
        setDiff({
          added: mkPackages(d.added),
          removed: mkPackages(d.removed),
          changed: mkPackages(d.changed),
          sizes: d.sizes,
          deployment: d.deployment,
          machine: d.machine,
        });
      },
      ["deployment", params.id],
    );
  });

  return (
    <Show when={diff()}>
      {(d) => (
        <>
          <h1 class="title">
            {d().machine}
            <span class="is-pulled-right">
              <div class="tags has-addons">
                <span class="tag is-family-monospace">
                  {date(d().deployment.created_at)}
                </span>

                <span class="tag is-dark">
                  by&nbsp;<b>{d().deployment.operator_id}</b>
                </span>
              </div>
            </span>
          </h1>

          <hr />

          <div class="block">
            <div class="field is-horizontal">
              <label class="label diff">New closure size :</label>
              <Size bytes={d().sizes.new} />
            </div>

            <div class="field is-horizontal">
              <label class="label diff">Size delta :</label>
              <Size bytes={d().sizes.new - d().sizes.old} colored signed />
            </div>
          </div>

          <PackageList
            title="Added packages"
            color="success"
            entries={d().added}
          />

          <PackageList
            title="Removed packages"
            color="danger"
            entries={d().removed}
          />

          <PackageList
            title="Changed packages"
            color="warning"
            entries={d().changed}
          />
        </>
      )}
    </Show>
  );
}
