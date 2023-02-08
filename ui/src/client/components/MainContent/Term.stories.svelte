<script lang="ts" module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import Term from "./Term.svelte";

  const ansiColors = `cat ansi-colors
[30m black [0m
[31m red [0m
[32m green [0m
[33m yellow [0m
[34m blue [0m
[35m magenta [0m
[36m cyan [0m
[37m white [0m
[90m brightBlack [0m
[91m brightRed [0m
[92m brightGreen [0m
[93m brightYellow [0m
[94m brightBlue [0m
[95m brightMagenta [0m
[96m brightCyan [0m
[97m brightWhite [0m`;

  const { Story } = defineMeta({
    title: "Term",
    component: Term,
    args: {
      text: ansiColors,
    },
    argTypes: {
      termBackground: { control: "color" },
    },
  });
</script>

<Story name="ansi colors" />
