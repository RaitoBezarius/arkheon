import { Component, For, Show } from "solid-js";
import { Version } from "../components/Version";
import { Size } from "../components/Size";

export const PackageList: Component<{
  title: string;
  color: "danger" | "success" | "warning";
  entries: Package[];
}> = ({ entries, color, title }) => {
  // const [sort, setSort] = createSignal(Sort.None);
  //
  return (
    <Show when={entries.length > 0}>
      <section class={`hero is-${color} block`}>
        <div class="hero-body py-5">
          <h2 class="title">{title}</h2>
          <For each={entries}>
            {({ name, size, versions, previous = null }) => (
              <div class="field is-grouped pkg">
                <Show when={previous} fallback={<Size bytes={size} />}>
                  <Size bytes={size - previous!.size} signed={true} />
                </Show>

                <div class="control">
                  <span class="is-family-monospace is-size-7">
                    <b>{name}&nbsp;:</b>
                  </span>
                </div>

                <Show when={previous}>
                  <For each={previous!.versions}>
                    {(v) => <Version v={v} />}
                  </For>

                  <span class="control">
                    <b class="is-size-7">to</b>
                  </span>
                </Show>

                <For each={versions}>{(v) => <Version v={v} />}</For>
              </div>
            )}
          </For>
        </div>
      </section>
    </Show>
  );
};
