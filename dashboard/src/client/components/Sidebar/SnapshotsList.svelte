<script lang="ts">
  import { getSnapshotKey } from '~/functions/snapshots';
  import type { Snapshot, SnapshotsGroups } from '~/types';

  export let snapshotsGroups: SnapshotsGroups;
  export let selected: Snapshot | undefined;
</script>

<div class="flex flex-col">
  {#each snapshotsGroups as [groupName, snapshots]}
    <div class="divider my-0 mx-2" />
    <div class="menu-title text-center capitalize">
      {groupName.replaceAll('_', ' ')}
    </div>

    {#each [...snapshots.values()] as snapshot}
      {@const isSelected = selected?.name === snapshot.name}
      {@const isNew = 'new' in snapshot}
      {@const name = snapshot.name.replaceAll('_', ' ')}

      <button
        class="tooltip tooltip-bottom my-0.5 hover:bg-sky-500 hover:bg-opacity-10 aria-selected:bg-sky-600"
        aria-selected={isSelected}
        data-tip={getSnapshotKey(snapshot)}
        on:click={() => (selected = snapshot)}
      >
        <div class="truncate py-2.5 px-2 text-start text-white">
          {#if isNew}
            <div class="badge-secondary badge text-xs font-black text-white">
              New
            </div>
          {/if}
          <span class="ml-1 text-sm font-medium capitalize">
            {name}
          </span>
        </div>
      </button>
    {/each}
  {/each}
</div>

<style lang="postcss">
  .tooltip-bottom:hover:before,
  .tooltip-bottom:hover:after {
    transition-delay: 1000ms;
  }
</style>
