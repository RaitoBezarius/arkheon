import { Component, For } from "solid-js";
import { sortVersions } from "../utils";
import { Size } from "../components/Size";
import { Version } from "../components/Version";

export const PackageDiff: Component<PackageDiff> = (props) => {
  const [vo, bo] = props.old;
  const [vn, bn] = props.new;
  const _old = sortVersions(vo);
  const _new = sortVersions(vn);

  return (
    <div class="field is-grouped pkg">
      {Size(bn - bo, true)}

      <div class="control">
        <span class="is-family-monospace is-size-7">
          <b>{props.name}&nbsp;:</b>
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
