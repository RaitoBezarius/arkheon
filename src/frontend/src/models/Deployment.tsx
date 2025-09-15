// SPDX-FileCopyrightText: 2025 Tom Hubrecht <github@mail.hubrecht.ovh>
//
// SPDX-License-Identifier: EUPL-1.2

import { Component } from "solid-js";
import { date, size as _size } from "../utils";

export const Deployment: Component<Deployment> = ({
  size,
  created_at,
  operator_id,
  toplevel,
  id,
}) => {
  const { value, unit } = _size(size);

  return (
    <tr>
      <td class="date">
        <span class="is-family-monospace">{date(created_at)}</span>
      </td>

      <td>
        <span>
          by&nbsp;<b>{operator_id}</b>
        </span>
      </td>

      <td>
        <a class="is-family-monospace" href={`/diff/${id}`}>
          {toplevel}
        </a>
      </td>

      <td>
        {value}&nbsp;{unit}
      </td>
    </tr>
  );
};
