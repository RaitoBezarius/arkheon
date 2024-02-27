export const get = async (path: string) =>
  fetch(`${import.meta.env.VITE_BACKEND_URL}/${path}`).then((d) => d.json());
