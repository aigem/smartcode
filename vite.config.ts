import { defineConfig } from "vite";
import { vitePlugin as remix } from "@remix-run/dev";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';

export default defineConfig({
  plugins: [remix(), tsconfigPaths()],
  css: {
    postcss: {
      plugins: [tailwindcss, autoprefixer],
    },
  },
});