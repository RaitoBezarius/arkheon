import { Component, For } from "solid-js";
import { sortVersions } from "../utils";
import { Size } from "../components/Size";
import { Version } from "../components/Version";

export const Package: Component<Package> = (props) => {
  const [v, bytes] = props.versions;
  const versions = sortVersions(v);

  return (
    <div class="field is-grouped pkg">
      {Size(bytes)}

      <div class="control">
        <span class="is-family-monospace is-size-7">
          <b>{props.name}&nbsp;:</b>
        </span>
      </div>

      <For each={versions}>{Version}</For>
    </div>
  );
};
