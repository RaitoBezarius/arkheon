import { For, createEffect, createSignal } from "solid-js";
import { Machine } from "../models/Machine";
import { get } from "../utils";

export default function Home() {
  const [machines, setMachines] = createSignal([]);

  createEffect(() => {
    get("machines", setMachines);
  });

  return (
    <>
      <div>
        <For each={machines()}>
          {(machine: Machine) => <Machine {...machine} />}
        </For>
      </div>
    </>
  );
}
