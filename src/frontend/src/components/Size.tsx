import { size } from "../utils";
import { Show } from "solid-js";

export const Size = (bytes: number, signed: boolean = false) => {
  const [value, unit] = size(Math.abs(bytes));
  return (
    <div class="control">
      <span class="tags has-addons">
        <b class="tag s-tag">
          <Show when={signed}>{bytes < 0 ? "- " : "+ "}</Show>
          {value}
        </b>
        <span class="tag is-white u-tag">{unit}</span>
      </span>
    </div>
  );
};
