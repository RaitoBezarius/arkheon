// SPDX-FileCopyrightText: 2025 Tom Hubrecht <github@mail.hubrecht.ovh>
//
// SPDX-License-Identifier: EUPL-1.2

export function Notification(props: any) {
  return <div class="notification is-primary">{props.state()}</div>;
}
