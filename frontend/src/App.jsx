import { createEffect, createSignal } from "solid-js";
import { Notification } from "./components/Notification";
import { Machine } from "./models/Machine";

const fetchMachines = async () =>
  (await fetch("http://127.0.0.1:8000/machines")).json();

function App() {
  const [machines, setMachines] = createSignal([]);

  createEffect(() => {
    fetchMachines().then(machines => {
      setMachines(machines);
    });
  })

  return (
    <>
      <div>
        <For each={machines()}>
          {machine => <Machine machine={machine} />}
        </For>
      </div>
    </>
  );
}

export default App;
