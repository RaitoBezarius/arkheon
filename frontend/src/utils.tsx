export const get = async (path: string) =>
  fetch(`${import.meta.env.VITE_BACKEND_URL}/${path}`).then((d) => d.json());

export const date = (s: string) =>
  new Intl.DateTimeFormat("en-GB", {
    timeStyle: "medium",
    dateStyle: "short",
  }).format(new Date(s));
