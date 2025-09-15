// SPDX-FileCopyrightText: 2025 Tom Hubrecht <github@mail.hubrecht.ovh>
//
// SPDX-License-Identifier: EUPL-1.2

import { Show, createMemo, createResource } from "solid-js";
import { useParams } from "@solidjs/router";
import { date, get, sortVersions } from "../utils";
import { Size } from "../components/Size";
import { NavButton } from "../components/NavButton";
import { PackageList } from "../models/PackageList";
import { URLS } from "../urls";
import { Dynamic } from "solid-js/web";
import {
  IconArrowMoveDownFilled,
  IconArrowMoveUpFilled,
} from "@tabler/icons-solidjs";

const mkPackages = (pkgs: RawPackages): Package[] =>
  Object.entries(pkgs).map(([name, v]) =>
    Array.isArray(v)
      ? { name, size: v[1], versions: sortVersions(v[0]) }
      : {
          name,
          size: v.new[1],
          versions: sortVersions(v.new[0]),
          previous: {
            size: v.old[1],
            versions: sortVersions(v.old[0]),
          },
        },
  );

const Diff = () => {
  const params = useParams();

  const [rawDiff] = createResource(
    () => params.id,
    async (id) =>
      (await get(URLS.get_deployment_diff, ["deployment", id])) as RawDiff,
  );

  const navigate = (way: "prev" | "next") =>
    createMemo<number | null>(
      (val) => (rawDiff.state == "ready" ? rawDiff().navigation[way] : val),
      null,
    );

  const prev = navigate("prev");
  const next = navigate("next");

  const diff = createMemo<Diff | null>((prev) => {
    if (rawDiff.state == "ready") {
      const { added, removed, changed, sizes, deployment, machine } = rawDiff();
      return {
        added: mkPackages(added),
        removed: mkPackages(removed),
        changed: mkPackages(changed),
        sizes,
        deployment,
        machine,
      };
    } else {
      return prev;
    }
  }, null);

  return (
    <Show when={diff()}>
      {(d) => (
        <>
          <h1 class="title">
            {d().machine}
            <span class="is-pulled-right">
              <div class="tags has-addons">
                <span class="tag is-family-monospace">
                  {date(d().deployment.created_at)}
                </span>

                <span class="tag is-dark">
                  by&nbsp;<b>{d().deployment.operator_id}</b>
                </span>
              </div>
            </span>
          </h1>

          <hr />

          <div class="block">
            <div class="buttons is-pulled-right has-addons">
              <NavButton
                id={next()}
                icon={<IconArrowMoveUpFilled />}
                text="Next deployment"
              ></NavButton>

              <NavButton
                id={prev()}
                icon={<IconArrowMoveDownFilled />}
                text="Previous deployment"
              ></NavButton>
            </div>

            <div class="field is-horizontal">
              <label class="label diff">New closure size :</label>
              <Size bytes={d().sizes.new} />
            </div>

            <div class="field is-horizontal">
              <label class="label diff">Size delta :</label>
              <Size bytes={d().sizes.new - d().sizes.old} colored signed />
            </div>
          </div>

          <Dynamic
            component={PackageList}
            title="Added packages"
            color="success"
            entries={d().added}
          />

          <PackageList
            title="Removed packages"
            color="danger"
            entries={d().removed}
          />

          <PackageList
            title="Changed packages"
            color="warning"
            entries={d().changed}
          />
        </>
      )}
    </Show>
  );
};

export default Diff;
