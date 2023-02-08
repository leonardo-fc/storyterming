<script lang="ts">
  import { afterUpdate } from 'svelte';
  import { diffLines } from 'diff';
  import stripAnsi from 'strip-ansi';
  import { pick } from '~/functions/pick';
  import type { Snapshot, SnapshotId } from '~/types';
  import Term from './MainContent/Term.svelte';
  import Loading from './common/Loading.svelte';
  import { withLoading } from '../services/withLoading';
  import { flash } from '~/client/animations/flash';

  export let selectedSnapshot: Snapshot | undefined;
  export let onUpdateSnapshot: (snapshot: SnapshotId) => unknown;

  let showLineNumbers = false;
  let showDiff = false;

  let div: ElementCSSInlineStyle;
  afterUpdate(() => {
    flash(div);
  });

  const { isLoading, fn: _onUpdateSnapshot } = withLoading(onUpdateSnapshot);
  const updateSnapshot = (snapshot: Snapshot) => () =>
    _onUpdateSnapshot(pick(snapshot, 'name', 'group'));

  $: bothSnapshots =
    selectedSnapshot &&
    'current' in selectedSnapshot &&
    'new' in selectedSnapshot
      ? selectedSnapshot
      : undefined;

  $: diff = (() => {
    if (!bothSnapshots || !showDiff) return;

    const endWithLineBreak = (s: string) => (!s.endsWith('\n') ? `${s}\n` : s);
    const current = endWithLineBreak(stripAnsi(bothSnapshots.current));
    const newer = stripAnsi(bothSnapshots.new);

    return diffLines(current, newer)
      .map((part) => {
        const color = part.added ? '[32m+' : part.removed ? '[31m-' : '[30m';
        return `${color} ${part.value}[0m`;
      })
      .join('');
  })();
</script>

<div
  class="flex grow overflow-y-scroll bg-zinc-800 p-6 shadow-lg shadow-zinc-900"
>
  {#if $isLoading}
    <Loading />
  {:else if !selectedSnapshot}
    <h1 class="center">Select snapshot</h1>
  {:else}
    <div class="flex-col">
      <div class="flex">
        <label class="label cursor-pointer">
          <span class="label-text mr-4">Line numbers</span>
          <input
            type="checkbox"
            class="checkbox"
            disabled={!!diff}
            bind:checked={showLineNumbers}
          />
        </label>
        {#if bothSnapshots}
          <label class="label cursor-pointer">
            <span class="label-text mr-4">Diff</span>
            <input type="checkbox" class="checkbox" bind:checked={showDiff} />
          </label>
        {/if}
      </div>
      <br />

      <div bind:this={div} class="pb-6">
        {#if diff}
          <Term diffMode text={diff} {showLineNumbers} />
        {:else if !('new' in selectedSnapshot)}
          <Term text={selectedSnapshot.current} {showLineNumbers} />
        {:else}
          {#if 'current' in selectedSnapshot}
            <h1 class="mb-2">Current</h1>
            <Term text={selectedSnapshot.current} {showLineNumbers} />
            <br />
          {/if}
          <div class="my-2 flex justify-between">
            <h1>New</h1>
            <button
              class="btn-primary btn"
              on:click={updateSnapshot(selectedSnapshot)}
            >
              Update
            </button>
          </div>
          <Term text={selectedSnapshot.new} {showLineNumbers} />
        {/if}
      </div>
    </div>
  {/if}
</div>
