<script lang="ts" module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { SnapshotsMap } from "~/shared/snapshots";
  import Dashboard from "./Dashboard.svelte";
  import { sleep } from "~/shared/sleep";

  const snapshotsMap = new SnapshotsMap();

  snapshotsMap.set({
    name: "do_not_work",
    group: "basic",
    current: `my-cli`,
  });
  snapshotsMap.set({
    name: "works",
    group: "basic",
    current: `my-cli`,
    new: `my-cli\nWorked`,
  });
  snapshotsMap.set({
    name: "verify_that_responses_do_not_changed",
    group: "provider",
    current: `target/debug/deal-maker provider --deals-dir deals\nStarted\n[2mVerifying App requests...[0m\n\n[90mApp[0m [33m0 changed[0m`,
  });
  snapshotsMap.set({
    name: "verify_that_responses_do_not_changed_2",
    group: "provider",
    current: `target/debug/deal-maker provider --deals-dir deals\nStarted\n[2mVerifying App requests...[0m\n\n[90mApp[0m [33m0 changed[0m`,
    new: `target/debug/deal-maker provider --deals-dir deals\nStarted\n[2mVerifying App requests...[0m\n\n[90mApp[0m [33m1 changed[0m`,
  });
  snapshotsMap.set({
    name: "echo ten-lines",
    group: "others",
    current: `echo ten-lines\n1\n2\n3\n4\n5\n6\n7\n8\n9\n10`,
  });
  snapshotsMap.set({
    name: "verify_that_this_cli_prints_a_very_big_log",
    group: "others",
    current: `ns preview
 i  ┌──────────────────────────────────────────┐
 i  ├─ {N} NativeScript Preview 2.0 [v1.0.2] ──┤
 i  └──────────────────────────── Public Beta ─┘
┃
┃
┃
┃
┃
┃
┃
┃
┃
┃
┃
┃
┃
┃
┃
┃
┃
┃
┃
┃
┃
┃
┃
┃
┃
┃
┃
┃
┃
┃
┃
┃
┃
┃
┃
┃
┃
┃
┃
┃
┃
 i  Scan the above QR code with your device to connect to this session.
 i  Scanning can be done with the default camera app on iOS or any other application capable of scanning QR codes.
 i
 i  This CLI is interactive, you can press the following keys any time (make sure the terminal has focus):
 i
 i    [R] - restart the Preview app on all connected devices
 i    [S] - reset the Preview app on all connected devices
 i    [O] - open the Web UI to scan the QR code
 i
 i  Waiting for device connections...
 i  Device connected:    1101234ST [android: 2.0.3 (18)]

✔ Building for android
  Compiled successfully in 5.80s

 i  Build complete. Uploading files...

✔ Building for android
  Compiled successfully in 349.13ms

 i  Upload complete. Applying changes on connected devices...
 i  Device disconnected: 1101234ST [android: 2.0.3 (18)]`,
  });

  const [first] = snapshotsMap.getAll();

  const onUpdateSnapshot = async () => {
    await sleep(500);
    throw new Error("Fake network error");
  };

  const { Story } = defineMeta({
    title: "Dashboard",
    component: Dashboard,
    args: {
      snapshotsMap,
      onUpdateSnapshot,
    },
  });
</script>

<Story name="Default" />
<Story name="Selected" args={{ selected: first }} />
