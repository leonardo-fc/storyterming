import type { Snapshot, SnapshotId } from '~/types';

export function getSnapshotKey(snapshot: SnapshotId) {
  return `${snapshot.group}/${snapshot.name}`;
}

export class SnapshotsMap {
  private groups = new Map<string, Map<string, Snapshot>>();
  private cachedNewSnapshots: undefined | [string, Map<string, Snapshot>][];

  constructor(snapshots?: Snapshot[]) {
    if (!snapshots) return;

    for (const snapshot of snapshots) {
      const group =
        this.groups.get(snapshot.group) ?? new Map<string, Snapshot>();

      group.set(snapshot.name, snapshot);
      this.groups.set(snapshot.group, group);
    }
  }

  getAll() {
    const all = [] as Snapshot[];
    for (const group of this.groups.values()) {
      for (const snapshot of group.values()) {
        all.push(snapshot);
      }
    }
    return all;
  }

  getGroups() {
    return [...this.groups.entries()];
  }

  get(snapshot: SnapshotId) {
    return this.groups.get(snapshot.group)?.get(snapshot.name);
  }

  set(snapshot: Snapshot) {
    this.cachedNewSnapshots = undefined;

    const group =
      this.groups.get(snapshot.group) ?? new Map<string, Snapshot>();

    group.set(snapshot.name, snapshot);
    this.groups.set(snapshot.group, group);
    return this;
  }

  delete(snapshot: SnapshotId) {
    this.cachedNewSnapshots = undefined;

    return this.groups.get(snapshot.group)?.delete(snapshot.name) ?? true;
  }

  getNewSnapshotGroups() {
    if (this.cachedNewSnapshots) return this.cachedNewSnapshots;

    const newSnapshots = [] as [string, Map<string, Snapshot>][];
    for (const [groupName, group] of this.groups.entries()) {
      const newGroups = new Map();

      for (const snapshot of group.values()) {
        if ('new' in snapshot) newGroups.set(snapshot.name, snapshot);
      }

      if (newGroups.size) newSnapshots.push([groupName, newGroups]);
    }
    this.cachedNewSnapshots = newSnapshots;
    return newSnapshots;
  }

  newSnapshotCount() {
    if (this.cachedNewSnapshots) return this.cachedNewSnapshots.length;

    let count = 0;
    for (const groups of this.groups.values()) {
      for (const snapshot of groups.values()) {
        if ('new' in snapshot) count++;
      }
    }
    return count;
  }
}
