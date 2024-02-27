import { For, Show, createEffect, createSignal } from "solid-js";
import { useParams } from "@solidjs/router";
import { date, get, size } from "../utils";
import { Package } from "../models/Package";
import { PackageDiff } from "../models/PackageDiff";

const ClosureSize = (bytes: number) => {
  const [value, unit] = size(bytes);
  return (
    <span class="tags has-addons ml-2">
      <b class="tag">{value}</b>
      <span class="tag is-dark">{unit}</span>
    </span>
  );
};

export default function Diff() {
  const [diff, setDiff] = createSignal<Diff>({
    added: new Map(),
    removed: new Map(),
    changed: new Map(),
    sizes: { old: 0, new: 0 },
  });

  const params = useParams();

  createEffect(() => {
    get(`diff-latest?deployment_id=${params.id}`).then((d: RawDiff) => {
      setDiff({
        added: new Map(Object.entries(d.added)),
        removed: new Map(Object.entries(d.removed)),
        changed: new Map(Object.entries(d.changed)),
        sizes: d.sizes,
        deployments: d.deployments,
      });
    });
  });

  return (
    <>
      <div class="block">
        <div class="field is-horizontal">
          <label class="label m-0">New closure size :</label>
          {ClosureSize(diff().sizes.new)}
        </div>

        <div class="field is-horizontal">
          <label class="label m-0">Old closure size :</label>
          {ClosureSize(diff().sizes.old)}
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

      <Show when={diff().added.size > 0}>
        <section class="hero is-success block">
          <div class="hero-body py-5">
            <h2 class="title">Added packages</h2>
            <For each={Array.from(diff().added.entries())}>
              {([name, versions]) => (
                <Package name={name} versions={versions} />
              )}
            </For>
          </div>
        </section>
      </Show>

      <Show when={diff().removed.size > 0}>
        <section class="hero is-danger block">
          <div class="hero-body py-5">
            <h2 class="title">Removed packages</h2>
            <For each={Array.from(diff().removed.entries())}>
              {([name, versions]) => (
                <Package name={name} versions={versions} />
              )}
            </For>
          </div>
        </section>
      </Show>

      <Show when={diff().changed.size > 0}>
        <section class="hero is-warning block">
          <div class="hero-body py-5">
            <h2 class="title">Changed packages</h2>
            <For each={Array.from(diff().changed.entries())}>
              {([name, update]) => <PackageDiff name={name} {...update} />}
            </For>
          </div>
        </section>
      </Show>
    </>
  );
}
