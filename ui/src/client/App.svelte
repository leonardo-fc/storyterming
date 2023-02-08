<script lang="ts">
  import { onMount } from "svelte";
  import { SnapshotsMap } from "~/shared/snapshots";
  import { api } from "./services/api";
  import Dashboard from "./components/Dashboard.svelte";
  import Layout from "./Layout.svelte";

  let snapshotsMap = $state.raw(new SnapshotsMap());

  onMount(() => {
    const { unsubscribe } = api.onChange.subscribe(undefined, {
      onData: (update) => {
        const newMap = new SnapshotsMap();
        newMap.set(snapshotsMap.getAll());

        switch (update.type) {
          case "initial":
            newMap.set(update.data);
            break;
          case "set":
            newMap.set(update.data);
            break;
          case "delete":
            newMap.delete(update.data);
            break;
        }
        snapshotsMap = newMap;
      },
    });
    return unsubscribe;
  });
</script>

<Layout>
  <Dashboard {snapshotsMap} onUpdateSnapshot={api.updateSnapshot.mutate} />
</Layout>
