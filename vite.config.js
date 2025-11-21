import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/widget/",
  server: {
    host: true,
    allowedHosts: [
      "localhost",
      ".trycloudflare.com", // Accetta tutti i domini cloudflare
    ],
  },
});
