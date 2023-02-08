import type { StorybookConfig } from "@storybook/svelte-vite";

const config: StorybookConfig = {
  stories: ["../src/client/**/*.stories.@(js|ts|svelte)"],
  addons: [
    "@storybook/addon-essentials",
    "@storybook/addon-svelte-csf",
    "@chromatic-com/storybook",
    "@storybook/experimental-addon-test",
  ],
  framework: {
    name: "@storybook/svelte-vite",
    options: {},
  },
};
export default config;
