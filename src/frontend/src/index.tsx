// SPDX-FileCopyrightText: 2025 Tom Hubrecht <github@mail.hubrecht.ovh>
//
// SPDX-License-Identifier: EUPL-1.2

/* @refresh reload */
import { lazy } from "solid-js";
import { render } from "solid-js/web";
import { Router, Route } from "@solidjs/router";
import "./sass/arkheon.scss";

const Home = lazy(() => import("./pages/Home"));
const Diff = lazy(() => import("./pages/SystemDiff"));
const NotFound = lazy(() => import("./pages/404"));
const ApiError = lazy(() => import("./pages/ApiError"));

render(
  () => (
    <Router>
      <Route path="/diff/:id" component={Diff} />
      <Route path="/api-error" component={ApiError} />
      <Route path="/" component={Home} />
      <Route path="*404" component={NotFound} />
    </Router>
  ),
  document.getElementById("app")!,
);
