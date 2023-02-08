<script lang="ts">
  import { flash } from '~/client/animations/flash';
  import type { SnapshotsMap } from '~/functions/snapshots';
  import type { Snapshot, SnapshotId } from '~/types';
  import MainContent from './MainContent.svelte';
  import SnapshotsList from './Sidebar/SnapshotsList.svelte';

  export let snapshotsMap: SnapshotsMap;
  export let selected: Snapshot | undefined;
  export let onUpdateSnapshot: (snapshot: SnapshotId) => unknown;

  let show: 'All' | 'New' = 'All';

  $: snapshotsGroups =
    show === 'New'
      ? snapshotsMap.getNewSnapshotGroups()
      : snapshotsMap.getGroups();

  $: newSnapshotsCount = snapshotsMap.newSnapshotCount();

  let listContainer: ElementCSSInlineStyle;
  $: (() => {
    show;
    flash(listContainer);
  })();
</script>

<div class="flex h-screen bg-zinc-700">
  <div class="flex w-80 flex-col gap-1 py-2">
    <div class="flex items-center justify-between py-3 pl-5 pr-8">
      <h1 class="">Show</h1>
      <div class="indicator">
        <div class="btn-group">
          {#each ['All', 'New'] as title}
            <input
              data-title={title}
              value={title}
              bind:group={show}
              class="btn-sm btn"
              type="radio"
              name="options"
            />
          {/each}
        </div>
        {#if newSnapshotsCount}
          <span
            class="badge-secondary badge indicator-item font-black text-white"
            >+{newSnapshotsCount}</span
          >
        {/if}
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
