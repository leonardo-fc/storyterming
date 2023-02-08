<script lang="ts">
  import { modalStore } from '../services/modalStore';
</script>

<!-- eslint-disable-next-line svelte/no-unused-svelte-ignore -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<div
  on:click={() => modalStore.set('')}
  class="modal {$modalStore ? 'modal-open' : ''} cursor-pointer"
>
  <label class="modal-box relative" for="">
    <h3 class="text-lg font-bold">Error</h3>
    <p class="py-4">
      {#each $modalStore.split('\n') as line}
        {line}<br />
      {/each}
    </p>
  </label>
</div>
