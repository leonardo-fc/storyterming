<script lang="ts">
  import { modal } from "../services/modal.svelte";

  let dialog = $state<HTMLDialogElement>();
  let message = $state("");

  $effect(() => {
    if (modal.message != null) {
      message = modal.message;
      dialog?.showModal();
    } else {
      dialog?.close();
    }
  });
</script>

<dialog bind:this={dialog} onclose={modal.reset} class="modal">
  <div class="modal-box">
    <form method="dialog">
      <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
        ✕
      </button>
    </form>

    <h3 class="text-lg font-bold">Error</h3>
    <p class="py-4">
      {#each message.split("\n") as line}
        {line}<br />
      {/each}
    </p>
  </div>

  <form method="dialog" class="modal-backdrop">
    <button>close</button>
  </form>
</dialog>
