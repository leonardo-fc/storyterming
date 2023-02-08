<script lang="ts">
  import AnsiConverter from "ansi-to-html";
  import { slide } from "svelte/transition";

  let {
    text,
    termBackground = "#1e1e1e",
    showLineNumbers = false,
    diffMode = false,
  }: {
    text: string;
    termBackground?: string;
    showLineNumbers?: boolean;
    diffMode?: boolean;
  } = $props();

  const colors = {
    black: `#505050`,
    red: "#cd3131",
    green: "#0dbc79",
    yellow: "#e5e510",
    blue: "#2472c8",
    magenta: "#bc3fbc",
    cyan: "#11a8cd",
    white: "#e5e5e5",
    brightBlack: `#919191`,
    brightRed: "#f14c4c",
    brightGreen: "#23d18b",
    brightYellow: "#f5f543",
    brightBlue: "#3b8eea",
    brightMagenta: "#d670d6",
    brightCyan: "#29b8db",
    brightWhite: "#e5e5e5",
  };
  const convert = new AnsiConverter({
    colors: Object.values(colors),
    newline: true,
  });

  function getCommandAndOutput(text: string) {
    const [command = "", ...outputLines] = text.split(/\n|\r\n/);

    return [command, outputLines.map((v) => convert.toHtml(v))] as const;
  }

  let container = $state<HTMLElement>();
  function getTextWidth(text: string) {
    if (!container) return;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.font = getComputedStyle(container).font;
    const textMetric = ctx.measureText(text);
    return textMetric.width;
  }
</script>

<div
  bind:this={container}
  class="term-container break-words rounded-xl shadow-md"
  style="--term-bg: {termBackground}; --white: {colors.white}"
>
  {#if diffMode}
    <code>{@html convert.toHtml(text)}</code>
  {:else}
    {@const [command, outputLines] = getCommandAndOutput(text)}
    {@const lineNumberWidth = getTextWidth(outputLines.length.toString())}

    <div class="flex flex-wrap">
      <div class="relative mr-3 flex" style:min-width="{getTextWidth('❯')}px">
        <div
          aria-hidden={showLineNumbers}
          class="absolute"
          style:color={colors.brightGreen}
        >
          ❯
        </div>

        {#if showLineNumbers}
          <div
            transition:slide={{ axis: "x" }}
            class="text-current/50 z-10"
            style:background-color={termBackground}
          >
            <div style:width="{lineNumberWidth}px">0</div>
          </div>
        {/if}
      </div>

      <code>{command}</code><br />
    </div>

    {#each outputLines as line, index}
      <span class="flex flex-wrap">
        {#if showLineNumbers}
          {@render lineNumber(index + 1, lineNumberWidth)}
        {/if}

        <code>{@html line}</code><br />
      </span>
    {/each}
  {/if}
</div>

{#snippet lineNumber(number: number, lineNumberWidth?: number)}
  <div
    transition:slide={{ axis: "x" }}
    class="text-current/50 pr-3"
    style:text-wrap="nowrap"
  >
    <div style:width="{lineNumberWidth}px">{number}</div>
  </div>
{/snippet}

<style>
  .term-container {
    background-color: var(--term-bg);
    color: var(--white);
    width: 720px;
    padding: 18px 18px;
    font:
      14px SFMono-Regular,
      Consolas,
      Liberation Mono,
      Menlo,
      monospace;
    line-height: 18px;
  }
</style>
