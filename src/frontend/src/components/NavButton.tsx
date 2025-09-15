// SPDX-FileCopyrightText: 2025 Tom Hubrecht <github@mail.hubrecht.ovh>
//
// SPDX-License-Identifier: EUPL-1.2

import {
  Component,
  JSXElement,
  Show,
  createMemo,
  createSignal,
} from "solid-js";

export const NavButton: Component<{
  id: number | null;
  icon: JSXElement;
  text: string;
}> = (props) => {
  const [loading, setLoading] = createSignal(false);

  const url = createMemo<string>((prev) => {
    const res = `/diff/${props.id}`;

    if (res != prev) setLoading(false);

    return res;
  });

  const content = (
    <>
      <span class="icon">{props.icon}</span>
      <span>{props.text}</span>
    </>
  );
  return (
    <Show
      when={props.id}
      fallback={
        <button class="button is-primary is-light" disabled>
          {content}
        </button>
      }
    >
      <a
        href={url()}
        class="button is-primary is-light"
        classList={{ "is-loading": loading() }}
        onClick={() => setLoading(true)}
      >
        {content}
      </a>
    </Show>
  );
};
