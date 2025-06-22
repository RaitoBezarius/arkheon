// SPDX-FileCopyrightText: 2025 Tom Hubrecht <github@mail.hubrecht.ovh>
//
// SPDX-License-Identifier: EUPL-1.2

import { For, createEffect, createSignal } from "solid-js";
import { Machine } from "../models/Machine";
import { get } from "../utils";
import { URLS } from "../urls";

export default function Home() {
  const [machines, setMachines] = createSignal([]);

  createEffect(() => {
    get(URLS.get_machines, setMachines);
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
