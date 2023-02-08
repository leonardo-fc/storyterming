<script lang="ts">
  import { diffLines } from "diff";
  import stripAnsi from "strip-ansi";
  import { pick } from "~/shared/pick";
  import type { Snapshot, SnapshotId } from "~/shared/types";
  import Term from "./MainContent/Term.svelte";
  import AsyncButton from "./common/AsyncButton.svelte";
  import { flash } from "~/client/animations/flash";

  let {
    selectedSnapshot,
    onUpdateSnapshot,
  }: {
    selectedSnapshot?: Snapshot;
    onUpdateSnapshot: (snapshot: SnapshotId) => Promise<unknown>;
  } = $props();

  let showLineNumbers = $state(false);
  let showDiff = $state(false);

  let div = $state<ElementCSSInlineStyle>();
  $effect(() => {
    selectedSnapshot;
    flash(div);
  });

  let termsDiv = $state<ElementCSSInlineStyle>();
  /* $effect(() => {
  showDiff;
  flash(termsDiv);
}); */

  const updateSnapshot = (snapshot: Snapshot) => () =>
    onUpdateSnapshot(pick(snapshot, "name", "group"));

  const bothSnapshots = $derived(
    selectedSnapshot &&
      "current" in selectedSnapshot &&
      "new" in selectedSnapshot
      ? selectedSnapshot
      : undefined,
  );

  const diff = $derived.by(() => {
    if (!bothSnapshots || !showDiff) return;

    const current = stripAnsi(bothSnapshots.current);
    const newer = stripAnsi(bothSnapshots.new);

    return diffLines(current, newer, {
      // newlineIsToken: true,
      oneChangePerToken: true,
      stripTrailingCr: true,
    })
      .map((part) => {
        const color = part.added ? "[32m" : part.removed ? "[31m" : "[30m";
        const prefix = part.added ? "+" : part.removed ? "-" : " ";

        return `${color}${prefix} ${part.value}[0m`;
      })
      .join("");
  });
</script>

<div
  class="flex grow overflow-y-scroll bg-zinc-800 p-6 shadow-lg shadow-zinc-900"
>
  {#if !selectedSnapshot}
    <h1 class="center">Select snapshot</h1>
  {:else}
    <div bind:this={div} class="flex-col">
      <div class="flex gap-4">
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

        {#if "new" in selectedSnapshot}
          <AsyncButton
            class="btn-primary btn"
            onclick={updateSnapshot(selectedSnapshot)}
          >
            Update
          </AsyncButton>
        {/if}
      </div>
      <br />

      <div bind:this={termsDiv} class="pb-6">
        {#if diff}
          <Term diffMode text={diff} {showLineNumbers} />
        {:else if !("new" in selectedSnapshot)}
          <Term text={selectedSnapshot.current} {showLineNumbers} />
        {:else}
          {#if "current" in selectedSnapshot}
            <h1 class="mb-2">Current</h1>
            <Term text={selectedSnapshot.current} {showLineNumbers} />
            <br />
          {/if}
          <div class="my-2 flex justify-between">
            <h1 class="mb-2">New</h1>
          </div>
          <Term text={selectedSnapshot.new} {showLineNumbers} />
        {/if}
      </div>
    </div>
  {/if}
</div>
