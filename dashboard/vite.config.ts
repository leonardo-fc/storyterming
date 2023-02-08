import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import postcss from './postcss.config';

const isServer = process.env.SIDE === 'server';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [tsconfigPaths(), svelte()],
  css: { postcss },
  server: {
    watch: {
      ignored: isServer
        ? ['**/src/client/**', '**/src/main.*.ts']
        : ['**/src/server/**', '**/src/main.*.ts'],
    },
  },
  build: {
    outDir: 'dist/temp/client',
  },
});
