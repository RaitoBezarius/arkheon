import { Component } from "solid-js";

const ApiError: Component = () => {
  const params = new URLSearchParams(document.location.search);

  return (
    <>
      <div class="notification is-warning has-text-centered px-3 py-5">
        <h1 class="title">{params.get("error")}</h1>
        <a href="/">Go home</a>
      </div>
    </>
  );
};

export default ApiError;
