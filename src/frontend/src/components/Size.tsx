import { size } from "../utils";
import { Component, Show } from "solid-js";

const color = (colored: undefined | boolean, bytes: number) =>
  colored ? (bytes < 0 ? "is-danger is-light" : "is-success is-light") : "";

export const Size: Component<{
  bytes: number;
  signed?: boolean;
  colored?: boolean;
}> = ({ bytes, signed, colored }) => {
  const [value, unit] = size(Math.abs(bytes));

  return (
    <div class="control">
      <span class="tags has-addons">
        <b class={`tag s-tag ${color(colored, bytes)}`}>
          <Show when={signed}>{bytes < 0 ? "- " : "+ "}</Show>
          {value}
        </b>
        <span class="tag is-info u-tag">
          <b>{unit}</b>
        </span>
      </span>
    </div>
  );
};
