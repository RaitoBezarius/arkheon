import { defineConfig } from "vite";
import solid from "vite-plugin-solid";

export default defineConfig({
  server: {
    open: "/",
    proxy: {
      "/api/": "http://localhost:8000/",
    },
  },
  plugins: [solid()],
});
