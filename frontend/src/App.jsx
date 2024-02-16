import { createSignal } from "solid-js";
import { Notification } from "./components/Notification";
import { Machine } from "./models/Machine";

const fetchMachines = async () =>
  (await fetch("http://127.0.0.1:8000/machines")).json();

function App() {
  const [state, setState] = createSignal("Loading...");
  const [machines, setMachines] = createSignal([]);

  function getData() {
    setTimeout(() => {
      setState("Here are some values: Value 1, Value 2, Value 3");
      setMachines(fetchMachines())
    }, 1000); // Simulating an asynchronous operation
  }

  return (
    <>
      <div>
        <For each={machines}>
          {(machine, i) => <Machine machine={machine} />} i
        </For>

        <button class="button is-primary mb-3" onclick={getData}>
          Get Values
        </button>

        <Notification state={state} />
      </div>
    </>
  );
}

export default App;
