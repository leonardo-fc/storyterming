<script lang="ts">
  import { slide } from "svelte/transition";
  import { getSnapshotKey } from "~/shared/snapshots";
  import type { SnapshotId, SnapshotsGroups } from "~/shared/types";

  let {
    snapshotsGroups,
    selected = $bindable(),
  }: {
    snapshotsGroups: SnapshotsGroups;
    selected: SnapshotId | undefined;
  } = $props();
</script>

<div class="flex flex-col" role="tablist" aria-orientation="vertical">
  {#each snapshotsGroups as [groupName, snapshots]}
    <div class="divider mx-2 my-0"></div>
    <div class="menu-title text-center capitalize">
      {groupName.replaceAll("_", " ")}
    </div>

    {#each [...snapshots.values()] as snapshot}
      {@const isSelected = selected?.name === snapshot.name}
      {@const isNew = "new" in snapshot}
      {@const name = snapshot.name.replaceAll("_", " ")}

      <button
        role="tab"
        aria-selected={isSelected}
        data-tip={getSnapshotKey(snapshot)}
        onclick={() => (selected = snapshot)}
        class="tooltip tooltip-bottom my-0.5 cursor-pointer transition-colors duration-300 hover:bg-sky-500/10 aria-selected:bg-sky-600/60"
      >
        <div class="truncate px-2 py-2.5 text-start text-white">
          {#if isNew}
            <div
              transition:slide={{ axis: "x", duration: 200 }}
              class="badge-secondary badge badge-sm text-xs font-black text-white"
            >
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

<style>
  .tooltip-bottom:hover:before,
  .tooltip-bottom:hover:after {
    transition-delay: 1000ms;
  }
</style>
