import { Component, For, createEffect, createSignal, Show } from "solid-js";
import { Collapse } from "solid-collapse";
import { Deployment } from "./Deployment.tsx";
import { get } from "../utils";

export const Machine: Component<{ identifier: string }> = (props: Machine) => {
  const [isExpanded, setIsExpanded] = createSignal(true);
  const [deployments, setDeployments] = createSignal([]);

  createEffect(() => {
    get(`deployments/${props.identifier}`).then(setDeployments);
  });

  return (
    <div class="box">
      <h3 class="mb-3">
        <b>{props.identifier}</b>
      </h3>
      <Show
        when={deployments().length > 0}
        fallback={<p>No deployment available yet.</p>}
      >
        <Collapse value={isExpanded()}>
          <ul>
            <For each={deployments()}>
              {(deployment: Deployment) => (
                <li>
                  <Deployment {...deployment} />
                </li>
              )}
            </For>
          </ul>
        </Collapse>
      </Show>
    </div>
  );
};
