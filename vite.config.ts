import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  // "./" — относительные пути: сайт работает и на корне, и в подпапке GitHub Pages (/diagnostic/)
  base: "./",
  plugins: [react()],
  server: { host: true, port: 8080, strictPort: true },
});
