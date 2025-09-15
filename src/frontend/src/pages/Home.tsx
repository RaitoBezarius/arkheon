// SPDX-FileCopyrightText: 2025 Tom Hubrecht <github@mail.hubrecht.ovh>
//
// SPDX-License-Identifier: EUPL-1.2

import { For, createResource } from "solid-js";
import { Machine } from "../models/Machine";
import { get } from "../utils";
import { URLS } from "../urls";

const Home = () => {
  const [machines] = createResource(
    async () => (await get(URLS.get_machines)) as Machine[],
    { initialValue: [] },
  );

  return <For each={machines()}>{(obj) => <Machine {...obj} />}</For>;
};

export default Home;
