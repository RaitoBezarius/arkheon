import { size } from "../utils";
import { Component, Show, createEffect, createSignal } from "solid-js";

const color = (colored: undefined | boolean, bytes: number) =>
  colored ? (bytes < 0 ? "is-danger is-light" : "is-success is-light") : "";

export const Size: Component<{
  bytes: number;
  signed?: boolean;
  colored?: boolean;
}> = (props) => {
  const bytes = () => props.bytes;

  const [value, setValue] = createSignal<string>();
  const [unit, setUnit] = createSignal<string>();

  createEffect(() => {
    const [v, u] = size(Math.abs(bytes()));
    setValue(v);
    setUnit(u);
  });

  return (
    <div class="control">
      <span class="tags has-addons">
        <b class={`tag s-tag ${color(props.colored, bytes())}`}>
          <Show when={props.signed}>{bytes() < 0 ? "- " : "+ "}</Show>
          {value()}
        </b>
        <span class="tag is-info u-tag">
          <b>{unit()}</b>
        </span>
      </span>
    </div>
  );
};
