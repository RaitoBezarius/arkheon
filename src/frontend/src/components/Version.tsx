import { Show } from "solid-js";

export const Version = ([value, count]: [string, number]) => (
  <div class="control ">
    <span class="tags has-addons">
      <span class="tag">{value}</span>
      <Show when={count > 1}>
        <span class="tag is-link is-light">&times;&nbsp;{count}</span>
      </Show>
    </span>
  </div>
);
