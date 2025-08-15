import tailwindcss from '@tailwindcss/vite';
import { defineConfig, WxtViteConfig } from 'wxt';
import path from "path";

// See https://wxt.dev/api/config.html
export default defineConfig({
  vite: () => ({
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./"), // or "./src" if using src directory
      },
    },
  }) as WxtViteConfig,
  srcDir: 'src',
  manifest: {
    permissions: ['storage']
  },
  svelte: {
    vite: {
      compilerOptions: {
        experimental: {
          async: true
        }
      }
    }
  },
  modules: ['@wxt-dev/module-svelte'],
});
