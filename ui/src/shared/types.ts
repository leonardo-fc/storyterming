export type UpdateEvent =
  | { type: "initial"; data: Snapshot[] }
  | { type: "set"; data: Snapshot }
  | { type: "delete"; data: SnapshotId };

export type SnapshotId = { name: string; group: string };

export type Snapshot = SnapshotId &
  ({ current: string } | { new: string } | { current: string; new: string });

export type SnapshotsGroups = [string, Map<string, Snapshot>][];
