// SPDX-FileCopyrightText: 2025 Tom Hubrecht <github@mail.hubrecht.ovh>
//
// SPDX-License-Identifier: EUPL-1.2

import {
  Component,
  JSXElement,
  Show,
  createEffect,
  createSignal,
} from "solid-js";
import { useParams } from "@solidjs/router";
import { date, get, sortVersions } from "../utils";
import { Size } from "../components/Size";
import { PackageList } from "../models/PackageList";
import { URLS } from "../urls";
import { Dynamic } from "solid-js/web";
import {
  IconArrowMoveDownFilled,
  IconArrowMoveUpFilled,
} from "@tabler/icons-solidjs";

const NavButton: Component<{
  id: number | null;
  icon: JSXElement;
  text: string;
}> = (props) => {
  const id = () => props.id;

  const [loading, setLoading] = createSignal(false);
  const [url, setUrl] = createSignal<string>();

  createEffect(() => {
    setUrl(`/diff/${id()}`);
    setLoading(false);
  });

  const content = (
    <>
      <span class="icon">{props.icon}</span>
      <span>{props.text}</span>
    </>
  );
  return (
    <Show
      when={id()}
      fallback={
        <button class="button is-primary is-light" disabled>
          {content}
        </button>
      }
    >
      <a
        href={url()}
        class="button is-primary is-light"
        classList={{
          "is-loading": loading(),
        }}
        onClick={() => setLoading(true)}
      >
        {content}
      </a>
    </Show>
  );
};
export default function Diff() {
  const [diff, setDiff] = createSignal<Diff>();
  const [prev, setPrev] = createSignal<number | null>(null);
  const [next, setNext] = createSignal<number | null>(null);

  const params = useParams();

  const mkPackages = (_pkgs: RawPackages): Package[] => {
    let pkgs: Package[] = [];

    for (const [name, v] of Object.entries(_pkgs)) {
      if (Array.isArray(v)) {
        // The package is simple
        const [vs, s] = v;

        pkgs.push({ name: name, size: s, versions: sortVersions(vs) });
      } else {
        // The package is actually a diff
        const [nv, ns] = v.new;
        const [ov, os] = v.old;

        pkgs.push({
          name: name,
          size: ns,
          versions: sortVersions(nv),
          previous: { size: os, versions: sortVersions(ov) },
        });
      }
    }

    return pkgs;
  };

  createEffect(() => {
    get(
      URLS.get_deployment_diff,
      (d: RawDiff) => {
        setDiff({
          added: mkPackages(d.added),
          removed: mkPackages(d.removed),
          changed: mkPackages(d.changed),
          sizes: d.sizes,
          deployment: d.deployment,
          machine: d.machine,
        });
        setPrev(d.navigation.prev);
        setNext(d.navigation.next);
      },
      ["deployment", params.id],
    );
  });

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
}
