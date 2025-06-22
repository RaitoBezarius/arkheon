import { Component, For, Show, createEffect } from "solid-js";
import { Version } from "../components/Version";
import { Size } from "../components/Size";
import {
  IconArrowsSort,
  IconSortAscendingLetters,
  IconSortAscendingSmallBig,
  IconSortDescendingLetters,
  IconSortDescendingSmallBig,
} from "@tabler/icons-solidjs";
import { createStore } from "solid-js/store";

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
}> = (props) => {
  const entries = () => props.entries;

  const [store, setStore] = createStore<{
    pkgs: Package[];
    reversed: boolean;
    sort: Sort;
  }>({
    pkgs: [],
    reversed: false,
    sort: Sort.None,
  });

  const arrow = () => {
    switch (store.sort) {
      case Sort.Alphabetical:
        return store.reversed ? (
          <IconSortDescendingLetters />
        ) : (
          <IconSortAscendingLetters />
        );
      case Sort.Size:
        return store.reversed ? (
          <IconSortDescendingSmallBig />
        ) : (
          <IconSortAscendingSmallBig />
        );
      case Sort.None:
        return <IconArrowsSort />;
    }
  };

  const sortFunction = () => {
    switch (store.sort) {
      case Sort.Alphabetical:
        return (a: Package, b: Package) => a.name.localeCompare(b.name);
      case Sort.Size:
        return (a: Package, b: Package) => delta(a) - delta(b);
      default:
        return (_a: Package, _b: Package) => 1;
    }
  };

  const sortedPkgs = () => {
    const ps = store.pkgs.slice();

    ps.sort(sortFunction());

    if (store.reversed) {
      ps.reverse();
    }

    return ps;
  };

  createEffect(() => {
    setStore("pkgs", entries());
    setStore("sort", Sort.None);
  });

  const load =
    (callback: () => void) =>
    (e: MouseEvent & { currentTarget: HTMLButtonElement }) => {
      const t = e.currentTarget;

      t.classList.add("is-loading");

      setTimeout(() => {
        callback();
        t.classList.remove("is-loading");
      }, 15);
    };

  const Switch: Component<{ value: Sort }> = ({ value }) => {
    return (
      <p class="control">
        <button
          class="button is-small"
          classList={{
            "is-info": store.sort === value,
            "is-light": store.sort !== value,
          }}
          onclick={load(() => setStore("sort", value))}
        >
          {value}
        </button>
      </p>
    );
  };

  return (
    <Show when={store.pkgs.length > 0}>
      <section class={`notification is-${props.color} block`}>
        <div class="field has-addons is-pulled-right">
          <Switch value={Sort.Alphabetical} />

          <Switch value={Sort.Size} />

          <p class="control">
            <button
              class="button is-small is-info"
              onclick={load(() => setStore("reversed", (b) => !b))}
            >
              <span class="icon">{arrow()}</span>
            </button>
          </p>
        </div>

        <h2 class="title">{props.title}</h2>

        <For each={sortedPkgs()}>
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

              <div class="field is-grouped versions">
                <Show
                  when={previous}
                  fallback={
                    <For each={versions}>
                      {(v) => <Version v={v} cls="is-white" />}
                    </For>
                  }
                >
                  <For each={previous!.versions}>
                    {(v) => <Version v={v} cls="is-danger has-text-black" />}
                  </For>

                  <span class="control">
                    <b class="is-size-7">to</b>
                  </span>

                  <For each={versions}>
                    {(v) => <Version v={v} cls="is-success has-text-black" />}
                  </For>
                </Show>
              </div>
            </div>
          )}
        </For>
      </section>
    </Show>
  );
};
