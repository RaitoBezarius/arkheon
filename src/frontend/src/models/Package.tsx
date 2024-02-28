import { Component, For, Show } from "solid-js";
import { sortVersions } from "../utils";
import { Size } from "../components/Size";

export const Package: Component<Package> = (props) => {
  const [v, bytes] = props.versions;
  const versions = sortVersions(v);

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
      {Size(bytes)}
    </div>
  );
};
