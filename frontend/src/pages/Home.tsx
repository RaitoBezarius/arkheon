import { createEffect, createSignal } from "solid-js";
import { Machine } from "../models/Machine";

const fetchMachines = async () =>
  (await fetch("http://127.0.0.1:8000/machines")).json();

export default function Home() {
  const [machines, setMachines] = createSignal([]);

  createEffect(() => {
    fetchMachines().then(setMachines);
  });

  return (
    <>
      <div>
        <For each={machines()}>
          {(machine) => <Machine machine={machine} />}
        </For>
      </div>
    </>
  );
}
