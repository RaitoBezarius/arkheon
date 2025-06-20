import { Component, For, createEffect, createSignal, Show } from "solid-js";
import { Collapse } from "solid-collapse";
import { Deployment } from "./Deployment.tsx";
import { date, get } from "../utils";
import { FaSolidChevronDown, FaSolidChevronUp } from "solid-icons/fa";
import { URLS } from "../urls";

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
        <Show when={deployments().length > 0}>
          <span class="tag is-warning ml-5">
            {date(deployments()[0].created_at)}
          </span>
        </Show>
      </h3>

      <Show
        when={deployments().length > 0}
        fallback={<p>No deployment available yet.</p>}
      >
        <Collapse value={isExpanded()}>
          <div class="table-container deployments mt-2">
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
