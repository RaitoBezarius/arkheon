// SPDX-FileCopyrightText: 2025 Tom Hubrecht <github@mail.hubrecht.ovh>
//
// SPDX-License-Identifier: EUPL-1.2

import { Component, For, createEffect, createSignal, Show } from "solid-js";
import { Collapse } from "solid-collapse";
import { Deployment } from "./Deployment.tsx";
import { date, get } from "../utils";
import { URLS } from "../urls";
import { IconChevronDown, IconChevronUp } from "@tabler/icons-solidjs";

export const Machine: Component<Machine> = (props) => {
  const [isExpanded, setExpanded] = createSignal(true);
  const [deployments, setDeployments] = createSignal<Deployment[]>([]);

  const toggle = () => setExpanded((e) => !e);

  createEffect(() => {
    get(URLS.get_machine_deployments, setDeployments, [
      "machine",
      props.identifier,
    ]);
  });

  return (
    <div class="box">
      <button class="button is-small is-info is-pulled-right" onclick={toggle}>
        <span class="icon">
          {isExpanded() ? <IconChevronUp /> : <IconChevronDown />}
        </span>
      </button>

      <h3 classList={{ "mb-2": isExpanded() }}>
        <b>
          <span>{props.identifier}</span>
          <span class="tag ml-2 is-info">{deployments().length}</span>
        </b>
        <Show when={deployments().length > 0}>
          <a
            href={`/diff/${deployments()[0].id}`}
            class="tag is-primary ml-5 is-family-monospace"
          >
            {date(deployments()[0].created_at)}
          </a>
        </Show>
      </h3>

      <Show
        when={deployments().length > 0}
        fallback={<p>No deployment available yet.</p>}
      >
        <Collapse value={isExpanded()}>
          <div class="table-container deployments">
            <table class="table is-hoverable is-fullwidth is-striped mt-3">
              <tbody class="is-size-7">
                <For each={deployments()}>
                  {(d: Deployment) => <Deployment {...d} />}
                </For>
              </tbody>
            </table>
          </div>
        </Collapse>
      </Show>
    </div>
  );
};
