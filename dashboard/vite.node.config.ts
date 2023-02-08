import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import { VitePluginNode } from 'vite-plugin-node';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    tsconfigPaths(),
    ...VitePluginNode({
      appPath: 'src/main.ts',
      adapter: 'express', // we don't use, but the prop is required by plugin
    }),
  ],
  ssr: { format: 'cjs' },
  publicDir: '', // ignore assets
  build: {
    outDir: 'dist/temp/server',
    rollupOptions: {
      external: ['fsevents', 'chalk', 'bufferutil', 'utf-8-validate'],
    },
  },
});
