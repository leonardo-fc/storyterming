<script lang="ts">
  import type { HTMLButtonAttributes } from "svelte/elements";
  import { withLoading } from "~/client/services/withLoading.svelte";

  const {
    onclick,
    children,
    ...props
  }: Omit<HTMLButtonAttributes, "onclick"> & {
    onclick: () => Promise<unknown>;
  } = $props();

  const [loading, click] = withLoading(onclick);

  async function handleClick(button: HTMLButtonElement) {
    try {
      const width = button.getBoundingClientRect().width.toString();

      button.style.width = `${width}px`;
      await click();
    } finally {
      button.style.width = "";
    }
  }
</script>

<button {...props} onclick={(e) => handleClick(e.currentTarget)}>
  {#if loading()}
    <span class="loading loading-xs"></span>
  {:else}
    {@render children?.()}
  {/if}
</button>
