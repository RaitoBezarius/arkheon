import { createEffect, createSignal } from "solid-js";
import { Machine } from "../models/Machine";

const fetchMachines = async () =>
  (await fetch("/machines")).json();

// const fetchDiff = async (id) =>
  // (await fetch(`http://127.0.0.1:8000/diff/${id}`)).json();

export default function Diff() {
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
