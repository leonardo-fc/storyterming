import { defineConfig } from 'histoire';
import { HstSvelte } from '@histoire/plugin-svelte';
import { HstScreenshot } from '@histoire/plugin-screenshot';

// https://histoire.dev/guide/config
export default defineConfig({
  plugins: [
    HstSvelte(),
    HstScreenshot({
      ignored: (v) => v.story.title === 'Tailwind',
    }),
  ],
});
