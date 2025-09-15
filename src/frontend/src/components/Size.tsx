// SPDX-FileCopyrightText: 2025 Tom Hubrecht <github@mail.hubrecht.ovh>
//
// SPDX-License-Identifier: EUPL-1.2

import { size } from "../utils";
import { Component, Show } from "solid-js";

const color = (colored: undefined | boolean, bytes: number) =>
  colored ? (bytes < 0 ? "is-danger is-light" : "is-success is-light") : "";

export const Size: Component<{
  bytes: number;
  signed?: boolean;
  colored?: boolean;
}> = (props) => {
  const parts = () => size(props.bytes);

  return (
    <div class="control">
      <span class="tags has-addons">
        <b class={`tag s-tag ${color(props.colored, props.bytes)}`}>
          <Show when={props.signed}>{props.bytes < 0 ? "- " : "+ "}</Show>
          {parts().value}
        </b>
        <span class="tag is-info u-tag">
          <b>{parts().unit}</b>
        </span>
      </span>
    </div>
  );
};
