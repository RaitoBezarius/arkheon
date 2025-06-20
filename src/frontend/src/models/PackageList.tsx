import { Component, For, Show, createSignal } from "solid-js";
import { Version } from "../components/Version";
import { Size } from "../components/Size";
import { FaSolidArrowsUpDown } from "solid-icons/fa";

const enum Sort {
  Alphabetical = "Alphabetical",
  Size = "Size",
  None = "None",
}

const delta = (p: Package): number =>
  p.size - (p.previous ? p.previous.size : 0);

export const PackageList: Component<{
  title: string;
  color: "danger" | "success" | "warning";
  entries: Package[];
}> = ({ entries, color, title }) => {
  const [sort, setSort] = createSignal(Sort.None);
  const [pkgs, setPkgs] = createSignal(entries, { equals: false });

  const Switch: Component<{ value: Sort }> = ({ value }) => {
    return (
      <p class="control">
        <button
          class="button is-small"
          classList={{
            "is-info": sort() === value,
            "is-light": sort() !== value,
            // TODO: Add loading indication (using async ?)
            // "is-loading": loading(),
          }}
          onclick={() => updateSort(value)}
        >
          {value}
        </button>
      </p>
    );
  };

  const updateSort = (s: Sort) => {
    if (s === sort()) return;

    setSort(s);

    switch (s) {
      case Sort.Alphabetical:
        setPkgs((pkgs) => pkgs.sort((a, b) => a.name.localeCompare(b.name)));
        break;
      case Sort.Size:
        setPkgs((pkgs) => pkgs.sort((a, b) => delta(a) - delta(b)));
        break;
    }
  };

  return (
    <Show when={entries.length > 0}>
      <section class={`notification is-${color} block`}>
        <div class="field has-addons is-pulled-right">
          <Switch value={Sort.Alphabetical} />

          <Switch value={Sort.Size} />

          <p class="control">
            <button
              class="button is-small is-info"
              onclick={() => setPkgs((pkgs) => pkgs.reverse())}
            >
              <span class="icon">
                <FaSolidArrowsUpDown />
              </span>
            </button>
          </p>
        </div>

        <h2 class="title">{title}</h2>

        <For each={pkgs()}>
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

              <Show
                when={previous}
                fallback={
                  <For each={versions}>
                    {(v) => <Version v={v} cls="is-white" />}
                  </For>
                }
              >
                <For each={previous!.versions}>
                  {(v) => (
                    <Version v={v} cls="is-danger is-light has-text-black" />
                  )}
                </For>

                <span class="control">
                  <b class="is-size-7">to</b>
                </span>

                <For each={versions}>
                  {(v) => (
                    <Version v={v} cls="is-success is-light has-text-black" />
                  )}
                </For>
              </Show>
            </div>
          )}
        </For>
      </section>
    </Show>
  );
};
