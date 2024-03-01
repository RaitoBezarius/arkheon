import { Component } from "solid-js";
import { date } from "../utils";

export const Deployment: Component<Deployment> = (props) => {
  return (
    <tr>
      <td class="date">
        <span class="is-family-monospace">{date(props.created_at)}</span>
      </td>

      <td>
        <span>
          by&nbsp;<b>{props.operator_id}</b>
        </span>
      </td>

      <td>
        <a class="is-family-monospace" href={`/diff/${props.id}`}>
          {props.toplevel}
        </a>
      </td>
    </tr>
  );
};
