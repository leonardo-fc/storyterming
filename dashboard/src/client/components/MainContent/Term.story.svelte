<script lang="ts">
  import '~/client/app.css';
  export let Hst: Hst;

  import ColorPicker from 'svelte-awesome-color-picker';
  import Term from './Term.svelte';

  let termBackground = '#1e1e1e';
  let ansiColors = `cat ansi-colors
[30m black [0m
[31m red [0m
[32m green [0m
[33m yellow [0m
[34m blue [0m
[35m magenta [0m
[36m cyan [0m
[37m white [0m
[90m brightBlack [0m
[91m brightRed [0m
[92m brightGreen [0m
[93m brightYellow [0m
[94m brightBlue [0m
[95m brightMagenta [0m
[96m brightCyan [0m
[97m brightWhite [0m`;
</script>

<Hst.Story title="Term">
  <div class="root">
    <Term text={ansiColors} {termBackground} />
  </div>

  <svelte:fragment slot="controls">
    <div class="p-2">
      TermBackground <ColorPicker bind:hex={termBackground} isAlpha={false} />
    </div>
  </svelte:fragment>
</Hst.Story>
