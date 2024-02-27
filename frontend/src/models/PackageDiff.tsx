import { Component, For, Show } from "solid-js";

const sortVersions = (versions: Versions) => {
  const bag: Map<string, number> = new Map();
  for (const _v of versions) {
    const v = _v === null ? "none" : _v;
    const c = bag.get(v);
    bag.set(v, c === undefined ? 1 : c + 1);
  }

  return Array.from(bag.entries());
};

export const PackageDiff: Component<PackageDiff> = (props) => {
  const _old = sortVersions(props.old);
  const _new = sortVersions(props.new);

  return (
    <div class="field is-grouped is-grouped-multiline mb-2">
      <div class="control">
        <span class="is-family-monospace is-size-7">
          <b>{props.name}&nbsp;:</b>
        </span>
      </div>

      <For each={_old}>
        {([value, count]) => (
          <div class="control ">
            <span class="tags has-addons">
              <span class="tag is-danger is-light">{value}</span>
              <Show when={count > 1}>
                <span class="tag is-link is-light">&times;&nbsp;{count}</span>
              </Show>
            </span>
          </div>
        )}
      </For>

      <div class="control">
        <b class="is-size-7">to</b>
      </div>

      <For each={_new}>
        {([value, count]) => (
          <div class="control ">
            <span class="tags has-addons">
              <span class="tag is-success is-light">{value}</span>
              <Show when={count > 1}>
                <span class="tag is-link is-light">&times;&nbsp;{count}</span>
              </Show>
            </span>
          </div>
        )}
      </For>
    </div>
  );
};
