/* @refresh reload */
import { lazy } from "solid-js";
import { render } from "solid-js/web";
import { Router, Route } from "@solidjs/router";
import "./sass/bulma.sass"

const Home = lazy(() => import("./pages/Home"));
const Diff = lazy(() => import("./pages/SystemDiff"));
const NotFound = lazy(() => import("./pages/404"));

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
