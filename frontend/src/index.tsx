/* @refresh reload */
import { lazy } from "solid-js";
import { render } from "solid-js/web";
import { Router, Route } from "@solidjs/router";

const Home = lazy(() => import("./pages/Home.jsx"));
const Diff = lazy(() => import("./pages/SystemDiff.jsx"));
const NotFound = lazy(() => import("./pages/404.jsx"));

render(
  () => (
    <Router>
      <Route path="/diff/:id" component={Diff} />
      <Route path="/" component={Home} />
      <Route path="*404" component={NotFound} />
    </Router>
  ),
  document.getElementById("app")!,
);
