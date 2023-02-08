import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import tailwindcss from "@tailwindcss/vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [tsconfigPaths(), svelte(), tailwindcss()],
  server: {
    port: 6006,
    watch: {
      ignored: [
        "**/src/server/**",
        "**/src/main.ts",
        "**/src/client/**/*.stories.@(js|ts|svelte)",
      ],
    },
  },
  build: {
    outDir: "dist/temp/client",
  },
});
