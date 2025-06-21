import { Component } from "solid-js";
import { date, size } from "../utils";

export const Deployment: Component<Deployment> = (props) => {
  const [v, u] = size(Math.abs(props.size));

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

      <td>
        {v}&nbsp;{u}
      </td>
    </tr>
  );
};
