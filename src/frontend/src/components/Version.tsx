// SPDX-FileCopyrightText: 2025 Tom Hubrecht <github@mail.hubrecht.ovh>
//
// SPDX-License-Identifier: EUPL-1.2

import { Component, Show } from "solid-js";

export const Version: Component<{
  v: Version;
  cls?: string;
}> = (props) => {
  return (
    <div class="control">
      <span class="tags has-addons">
        <span class={`tag ${props.cls || ""}`}>{props.v.value}</span>
        <Show when={props.v.count > 1}>
          <span class="tag is-white">&times;&nbsp;{props.v.count}</span>
        </Show>
      </span>
    </div>
  );
};
