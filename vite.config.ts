import path from "path";
import svelte from "@vitejs/plugin-svelte";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
export default defineConfig({
  plugins: [svelte(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"), // or "./src" if using src directory
      $lib: path.resolve("./src/lib"),
    },
  },
});
