// SPDX-FileCopyrightText: 2025 Tom Hubrecht <github@mail.hubrecht.ovh>
//
// SPDX-License-Identifier: EUPL-1.2

import { For, createResource } from "solid-js";
import { Machine } from "../models/Machine";
import { get } from "../utils";
import { URLS } from "../urls";

const fetchMachines = async () => (await get(URLS.get_machines)) as Machine[];

export default function Home() {
  const [machines] = createResource(fetchMachines, {
    initialValue: [],
  });

  return (
    <>
      <For each={machines()}>{(machine) => <Machine {...machine} />}</For>
    </>
  );
}
