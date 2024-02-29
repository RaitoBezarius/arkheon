import { Show, createEffect, createSignal } from "solid-js";
import { useParams } from "@solidjs/router";
import { date, get, sortVersions } from "../utils";
import { Size } from "../components/Size";
import { PackageList } from "../models/PackageList";

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
    get(`diff-latest?deployment_id=${params.id}`).then((d: RawDiff) => {
      setDiff({
        added: mkPackages(d.added),
        removed: mkPackages(d.removed),
        changed: mkPackages(d.changed),
        sizes: d.sizes,
        deployment: d.deployments.new,
      });
    });
  });

  return (
    <Show when={diff()}>
      {(d) => (
        <>
          <div class="block">
            <div class="field is-horizontal">
              <label class="label my-0 mr-3">New closure size :</label>
              <Size bytes={d().sizes.new} />
            </div>

            <div class="field is-horizontal">
              <label class="label my-0 mr-3">Old closure size :</label>
              <Size bytes={d().sizes.old} />
            </div>

            <div class="field is-horizontal">
              <label class="label m-0">Applied on :</label>
              <div class="tags has-addons ml-2">
                <span class="tag is-family-monospace">
                  {date(d().deployment.created_at)}
                </span>

                <span class="tag is-dark">
                  by&nbsp;<b>{d().deployment.operator_id}</b>
                </span>
              </div>
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
