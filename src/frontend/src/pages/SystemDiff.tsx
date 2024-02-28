import { For, JSXElement, Show, createEffect, createSignal } from "solid-js";
import { useParams } from "@solidjs/router";
import { date, get, sortVersions } from "../utils";
import { Size } from "../components/Size";
import { Version } from "../components/Version";

type Package<T> = [string, T];

const PackageList = <T,>(
  title: string,
  color: string,
  entries: Array<Package<T>>,
  display: (_: Package<T>) => JSXElement,
) => {
  return (
    <Show when={entries.length > 0}>
      <section class={`hero is-${color} block`}>
        <div class="hero-body py-5">
          <h2 class="title">{title}</h2>
          <For each={entries}>{display}</For>
        </div>
      </section>
    </Show>
  );
};

const Package = ([name, _versions]: Package<Versions>) => {
  const [v, bytes] = _versions;
  const versions = sortVersions(v);

  return (
    <div class="field is-grouped pkg">
      {Size(bytes)}

      <div class="control">
        <span class="is-family-monospace is-size-7">
          <b>{name}&nbsp;:</b>
        </span>
      </div>

      <For each={versions}>{Version}</For>
    </div>
  );
};

const PackageDiff = ([name, props]: Package<{
  old: Versions;
  new: Versions;
}>) => {
  const [vo, bo] = props.old;
  const [vn, bn] = props.new;
  const _old = sortVersions(vo);
  const _new = sortVersions(vn);

  return (
    <div class="field is-grouped pkg">
      {Size(bn - bo, true)}
      <div class="control">
        <span class="is-family-monospace is-size-7">
          <b>{name}&nbsp;:</b>
        </span>
      </div>

      <For each={_old}>{Version}</For>

      <div class="control">
        <b class="is-size-7">to</b>
      </div>

      <For each={_new}>{Version}</For>
    </div>
  );
};

export default function Diff() {
  const [addedPkgs, setAddedPkgs] = createSignal<Array<Package<Versions>>>([]);
  const [removedPkgs, setremovedPkgs] = createSignal<Array<Package<Versions>>>(
    [],
  );
  const [changedPkgs, setchangedPkgs] = createSignal<
    Array<Package<{ old: Versions; new: Versions }>>
  >([]);

  const [diff, setDiff] = createSignal<Diff>({
    sizes: { old: 0, new: 0 },
  });

  const params = useParams();

  createEffect(() => {
    get(`diff-latest?deployment_id=${params.id}`).then((d: RawDiff) => {
      setDiff({
        sizes: d.sizes,
        deployments: d.deployments,
      });

      setAddedPkgs(Array.from(Object.entries(d.added)));
      setremovedPkgs(Array.from(Object.entries(d.removed)));
      setchangedPkgs(Array.from(Object.entries(d.changed)));
    });
  });

  return (
    <>
      <div class="block">
        <div class="field is-horizontal">
          <label class="label my-0 mr-3">New closure size :</label>
          {Size(diff().sizes.new)}
        </div>

        <div class="field is-horizontal">
          <label class="label my-0 mr-3">Old closure size :</label>
          {Size(diff().sizes.old)}
        </div>

        <Show when={diff().deployments}>
          {(d) => (
            <div class="field is-horizontal">
              <label class="label m-0">Applied on :</label>
              <div class="tags has-addons ml-2">
                <span class="tag is-family-monospace">
                  {date(d().new.created_at)}
                </span>

                <span class="tag is-dark">
                  by&nbsp;<b>{d().new.operator_id}</b>
                </span>
              </div>
            </div>
          )}
        </Show>
      </div>

      {PackageList("Added packages", "success", addedPkgs(), Package)}
      {PackageList("Removed packages", "danger", removedPkgs(), Package)}
      {PackageList("Changed packages", "warning", changedPkgs(), PackageDiff)}
    </>
  );
}
