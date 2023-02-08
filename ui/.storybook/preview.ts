import Layout from "~/client/Layout.svelte";
import type { Preview } from "@storybook/svelte";

import "../src/client/app.css";

const preview: Preview = {
  decorators: [() => ({ Component: Layout })],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};
export default preview;
