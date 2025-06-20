import { size } from "../utils";
import { Component, Show } from "solid-js";

export const Size: Component<{
  bytes: number;
  signed?: boolean;
}> = ({ bytes, signed }) => {
  const [value, unit] = size(Math.abs(bytes));

  return (
    <div class="control ">
      <span class="tags has-addons">
        <b class="tag s-tag">
          <Show when={signed}>{bytes < 0 ? "- " : "+ "}</Show>
          {value}
        </b>
        <span class="tag is-link is-light u-tag">
          <b>{unit}</b>
        </span>
      </span>
    </div>
  );
};
