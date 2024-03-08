import { Component, For, createEffect, createSignal, Show } from "solid-js";
import { Collapse } from "solid-collapse";
import { Deployment } from "./Deployment.tsx";
import { get } from "../utils";
import { FaSolidChevronDown, FaSolidChevronUp } from "solid-icons/fa";

export const Machine: Component<Machine> = (props) => {
  const [isExpanded, setExpanded] = createSignal(true);
  const [deployments, setDeployments] = createSignal([]);

  const toggle = () => setExpanded((e) => !e);

  createEffect(() => {
    get(`deployments/${props.identifier}`, setDeployments);
  });

  return (
    <div class="box">
      <button
        class="button is-small is-link is-light is-pulled-right"
        onclick={toggle}
      >
        <span class="icon">
          {isExpanded() ? <FaSolidChevronUp /> : <FaSolidChevronDown />}
        </span>
      </button>

      <h3>
        <b>
          {props.identifier} [{deployments().length}]
        </b>
      </h3>

      <Show
        when={deployments().length > 0}
        fallback={<p>No deployment available yet.</p>}
      >
        <Collapse value={isExpanded()}>
          <div class="table-container">
            <table class="table is-narrow is-fullwidth is-striped mt-3">
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
