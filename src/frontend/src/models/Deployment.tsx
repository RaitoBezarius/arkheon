import { Component } from "solid-js";
import { date } from "../utils";

export const Deployment: Component<Deployment> = (props) => {
  return (
    <tr>
      <td>
        <span class="is-family-monospace">{date(props.created_at)}</span>
      </td>

      <td>
        <a class="is-family-monospace" href={`/diff/${props.id}`}>
          {props.toplevel}
        </a>
      </td>

      <td>
        <span>
          by&nbsp;<b>{props.operator_id}</b>
        </span>
      </td>
    </tr>
  );
};
