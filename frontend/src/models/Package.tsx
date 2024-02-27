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

export const Package: Component<Package> = (props) => {
  const versions = sortVersions(props.versions);

  return (
    <div class="field is-grouped mb-2">
      <div class="control">
        <span class="is-family-monospace is-size-7">
          <b>{props.name}&nbsp;:</b>
        </span>
      </div>

      <For each={versions}>
        {([value, count]) => (
          <div class="control ">
            <span class="tags has-addons">
              <span class="tag">{value}</span>
              <Show when={count > 1}>
                <span class="tag is-dark">&times;&nbsp;{count}</span>
              </Show>
            </span>
          </div>
        )}
      </For>
    </div>
  );
};
