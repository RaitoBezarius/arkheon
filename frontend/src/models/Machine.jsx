import { For, createEffect, createSignal } from 'solid-js';
import { Collapse } from 'solid-collapse';
import { Deployment } from './Deployment';

const fetchDeployments = async (identifier) =>
  (await fetch(`http://127.0.0.1:8000/deployments/${identifier}`)).json();

export function Machine(props) {
  const [isExpanded, setIsExpanded] = createSignal(true);
  const [deployments, setDeployments] = createSignal([]);

  createEffect(() => {
    fetchDeployments(props.machine.identifier).then(setDeployments);
  });

  return (
    <div class="box">
      <h3><b>{props.machine.identifier}</b></h3>
      <Show when={deployments().length > 0} fallback={<p>No deployment available yet.</p>}>
        <Collapse value={isExpanded()}>
          <ul>
            <For each={deployments()}>
              {deployment => <li><Deployment deployment={deployment} /></li>}
            </For>
          </ul>
        </Collapse>
      </Show>
    </div>
  );
}
