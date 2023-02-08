<script lang="ts">
  import type { Snippet } from "svelte";
  import Modal from "./components/Modal.svelte";

  let { children }: { children: Snippet } = $props();
</script>

{@render children()}
<Modal />
