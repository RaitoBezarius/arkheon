import { For, Show, createEffect, createSignal } from "solid-js";
import { useParams } from "@solidjs/router";
import { get } from "../utils";
import { Package } from "../models/Package";
import { PackageDiff } from "../models/PackageDiff";

export default function Diff() {
  const [diff, setDiff] = createSignal<Diff>({
    added: new Map(),
    removed: new Map(),
    changed: new Map(),
  });

  const params = useParams();

  createEffect(() => {
    get(`diff-latest?deployment_id=${params.id}`).then((d: RawDiff) => {
      setDiff({
        added: new Map(Object.entries(d.added)),
        removed: new Map(Object.entries(d.removed)),
        changed: new Map(Object.entries(d.changed)),
      });
    });
  });

  return (
    <div>
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
    </div>
  );
}
