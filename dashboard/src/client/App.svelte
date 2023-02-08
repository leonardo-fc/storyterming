<script lang="ts">
  import { SnapshotsMap } from '~/functions/snapshots';
  import { api } from './services/api';
  import Dashboard from './components/Dashboard.svelte';
  import Modal from './components/Modal.svelte';

  let snapshotsMap = new SnapshotsMap();

  api.onChange.subscribe(undefined, {
    onData: (update) => {
      switch (update.type) {
        case 'initial':
          return (snapshotsMap = new SnapshotsMap(update.data));
        case 'set':
          snapshotsMap.set(update.data);
          return (snapshotsMap = snapshotsMap);
        case 'delete':
          snapshotsMap.delete(update.data);
          return (snapshotsMap = snapshotsMap);
      }
    },
  });
</script>

<main class="root">
  <Dashboard
    selected={undefined}
    {snapshotsMap}
    onUpdateSnapshot={api.updateSnapshot.mutate}
  />
</main>
<Modal />
