<script lang="ts">
  import { flash } from "~/client/animations/flash";
  import type { SnapshotsMap } from "~/shared/snapshots";
  import type { SnapshotId } from "~/shared/types";
  import MainContent from "./MainContent.svelte";
  import SnapshotsList from "./Sidebar/SnapshotsList.svelte";
  import { scale } from "svelte/transition";

  let {
    snapshotsMap,
    selected,
    onUpdateSnapshot,
  }: {
    snapshotsMap: SnapshotsMap;
    selected?: SnapshotId;
    onUpdateSnapshot: (snapshot: SnapshotId) => Promise<unknown>;
  } = $props();

  const showLabel = {
    all: "Show all",
    new: "Show new",
  };
  const options = Object.keys(showLabel) as (keyof typeof showLabel)[];
  let show = $state<keyof typeof showLabel>("all");

  const snapshotsGroups = $derived(
    show === "new"
      ? snapshotsMap.getNewSnapshotGroups()
      : snapshotsMap.getGroups(),
  );

  const newSnapshotsCount = $derived(snapshotsMap.newSnapshotCount());

  let listContainer = $state<ElementCSSInlineStyle>();
  $effect(() => {
    show;
    flash(listContainer);
  });
</script>

<div class="flex h-screen bg-zinc-700">
  <div class="flex w-80 flex-col gap-1 py-2">
    <div class="flex py-3 pl-5 pr-8">
      <div class="tabs tabs-box flex-1">
        {#each options as option}
          <input
            type="radio"
            name="options"
            aria-label={showLabel[option] +
              (option === "new" && newSnapshotsCount !== 0
                ? ` (${newSnapshotsCount})`
                : "")}
            value={option}
            bind:group={show}
            class="tab flex-1 [--tab-bg:#0284c7]"
          />
        {/each}
      </div>
    </div>

    <div bind:this={listContainer}>
      {#if !snapshotsGroups.length}
        <h1 class="center mt-10">Empty</h1>
      {:else}
        <SnapshotsList {snapshotsGroups} bind:selected />
      {/if}
    </div>
  </div>

  <MainContent
    selectedSnapshot={selected ? snapshotsMap.get(selected) : undefined}
    {onUpdateSnapshot}
  />
</div>
