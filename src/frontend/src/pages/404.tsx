// SPDX-FileCopyrightText: 2025 Tom Hubrecht <github@mail.hubrecht.ovh>
//
// SPDX-License-Identifier: EUPL-1.2

const NotFound = () => {
  return (
    <div class="notification is-warning has-text-centered px-3 py-5">
      <h1 class="title">Page not found...</h1>
      <a href="/">Go home</a>
    </div>
  );
};

export default NotFound;
