<script lang="ts">
  import AnsiConverter from 'ansi-to-html';

  export let text: string;
  export let termBackground = '#1e1e1e';
  export let showLineNumbers = false;
  export let diffMode = false;

  const colors = {
    black: `#505050`,
    red: '#cd3131',
    green: '#0dbc79',
    yellow: '#e5e510',
    blue: '#2472c8',
    magenta: '#bc3fbc',
    cyan: '#11a8cd',
    white: '#e5e5e5',
    brightBlack: `#919191`,
    brightRed: '#f14c4c',
    brightGreen: '#23d18b',
    brightYellow: '#f5f543',
    brightBlue: '#3b8eea',
    brightMagenta: '#d670d6',
    brightCyan: '#29b8db',
    brightWhite: '#e5e5e5',
  };
  const convert = new AnsiConverter({
    colors: Object.values(colors),
    newline: true,
  });

  const getCommandAndOutput = (text: string) => {
    const [command = '', ...outputLines] = text.split(/\n|\r\n/);

    return [command, outputLines.map((v) => convert.toHtml(v))] as const;
  };
</script>

<div
  class="term-container"
  style="--term-bg: {termBackground}; --white: {colors.white}"
>
  {#if diffMode}
    <!-- eslint-disable-next-line svelte/no-at-html-tags -->
    <code>{@html convert.toHtml(text)}</code>
  {:else}
    {@const [command, outputLines] = getCommandAndOutput(text)}

    <span class="prefix">{showLineNumbers ? '0' : '$'}</span>
    <code>{command}</code><br />
    {#each outputLines as line, index}
      <span hidden={!showLineNumbers} class="prefix">{index + 1}</span>
      <!-- eslint-disable-next-line svelte/no-at-html-tags -->
      <code>{@html line}</code><br />
    {/each}
  {/if}
</div>

<style lang="postcss">
  .prefix {
    @apply pl-1.5 pr-4 opacity-50;
  }
  .term-container {
    @apply break-words rounded-xl shadow-md;
    background-color: var(--term-bg);
    color: var(--white);
    width: 720px;
    padding: 18px 18px;
    font: 14px SFMono-Regular, Consolas, Liberation Mono, Menlo, monospace;
    line-height: 18px;
  }
</style>
