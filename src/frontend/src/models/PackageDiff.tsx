import { Component, For, Show } from "solid-js";
import { size, sortVersions } from "../utils";

const Size = (bytes: number) => {
  const [value, unit] = size(Math.abs(bytes));
  return (
    <div style="margin-left: auto">
      <span class="tags has-addons">
        <b class="tag">{bytes < 0 ? "-" : "+"} {value}</b>
        <span class="tag is-dark">{unit}</span>
      </span>
    </div>
  );
};

export const PackageDiff: Component<PackageDiff> = (props) => {
  const [vo, bo] = props.old;
  const [vn, bn] = props.new;
  const _old = sortVersions(vo);
  const _new = sortVersions(vn);

  return (
    <div class="field is-grouped is-grouped-multiline">
      <div class="control">
        <span class="is-family-monospace is-size-7">
          <b>{props.name}&nbsp;:</b>
        </span>
      </div>

      <For each={_old}>
        {([value, count]) => (
          <div class="control">
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
          <div class="control">
            <span class="tags has-addons">
              <span class="tag is-success is-light">{value}</span>
              <Show when={count > 1}>
                <span class="tag is-link is-light">&times;&nbsp;{count}</span>
              </Show>
            </span>
          </div>
        )}
      </For>

      {Size(bn - bo)}
    </div>
  );
};
