// SPDX-FileCopyrightText: 2025 Tom Hubrecht <github@mail.hubrecht.ovh>
//
// SPDX-License-Identifier: EUPL-1.2

import { Component, For, Show, createResource, createSignal } from "solid-js";
import { Collapse } from "solid-collapse";
import { Deployment } from "./Deployment.tsx";
import { date, get } from "../utils";
import { URLS } from "../urls";
import { IconChevronDown, IconChevronUp } from "@tabler/icons-solidjs";

export const Machine: Component<Machine> = (props) => {
  const [isExpanded, setExpanded] = createSignal(false);

  const [deployments] = createResource(
    async () =>
      (await get(URLS.get_machine_deployments, [
        "machine",
        props.identifier,
      ])) as Deployment[],
    { initialValue: [] },
  );

  const lastDeployment = () => deployments().at(0);

  return (
    <div class="box">
      <section class="is-flex is-justify-content-space-between">
        <h3>
          <b>
            <span>{props.identifier}</span>
            <span class="tag ml-2 is-info">{deployments().length}</span>
          </b>
          <Show
            when={lastDeployment()}
            fallback={
              <span class="tag ml-4">
                <b>No deployment available yet.</b>
              </span>
            }
          >
            {(dep) => {
              // Delta in days since the last deployment
              const delta =
                (Date.now() - new Date(`${dep().created_at}Z`).getTime()) /
                (1000 * 86400);

              return (
                <a
                  href={`/diff/${dep().id}`}
                  class="tag ml-4 is-family-monospace"
                  classList={{
                    "is-info": 1 >= delta,
                    "is-success": 7 >= delta && delta > 1,
                    "is-warning": 14 >= delta && delta > 7,
                    "is-danger": delta > 14,
                  }}
                >
                  {date(dep().created_at)}
                </a>
              );
            }}
          </Show>
        </h3>

        <button
          class="button is-small is-info"
          onclick={() => setExpanded((e) => !e)}
        >
          <span class="icon">
            {isExpanded() ? <IconChevronUp /> : <IconChevronDown />}
          </span>
        </button>
      </section>

      <Collapse value={isExpanded()}>
        <Show when={deployments().length}>
          <hr class="my-3" />
          <div class="table-container deployments">
            <table class="table is-hoverable is-fullwidth is-striped">
              <tbody class="is-size-7">
                <For each={deployments()}>
                  {(d: Deployment) => <Deployment {...d} />}
                </For>
              </tbody>
            </table>
          </div>
        </Show>
      </Collapse>
    </div>
  );
};
