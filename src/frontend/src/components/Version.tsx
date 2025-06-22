// SPDX-FileCopyrightText: 2025 Tom Hubrecht <github@mail.hubrecht.ovh>
//
// SPDX-License-Identifier: EUPL-1.2

import { Component, Show } from "solid-js";

export const Version: Component<{
  v: Version;
  cls?: string;
}> = ({ v, cls = "" }) => {
  return (
    <div class="control ">
      <span class="tags has-addons">
        <span class={`tag ${cls}`}>{v.value}</span>
        <Show when={v.count > 1}>
          <span class="tag is-white">&times;&nbsp;{v.count}</span>
        </Show>
      </span>
    </div>
  );
};
