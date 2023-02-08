// import { SvelteMap } from "svelte/reactivity";
import type { Snapshot, SnapshotId } from "~/shared/types";

// const a=new SvelteMap<string, Map<string, Snapshot>>()

export function getSnapshotKey(snapshot: SnapshotId) {
  return `${snapshot.group}/${snapshot.name}`;
}

export class SnapshotsMap {
  private groups = new Map<string, Map<string, Snapshot>>();
  private cachedNewSnapshots: undefined | [string, Map<string, Snapshot>][];

  #set(snapshot: Snapshot) {
    const group =
      this.groups.get(snapshot.group) ?? new Map<string, Snapshot>();

    group.set(snapshot.name, snapshot);
    this.groups.set(snapshot.group, group);
  }

  set = (snapshots: Snapshot | Snapshot[]) => {
    this.cachedNewSnapshots = undefined;

    if (Array.isArray(snapshots)) {
      for (const snapshot of snapshots) {
        this.#set(snapshot);
      }
    } else {
      this.#set(snapshots);
    }
  };

  delete = (snapshot: SnapshotId) => {
    this.cachedNewSnapshots = undefined;

    return this.groups.get(snapshot.group)?.delete(snapshot.name) ?? true;
  };

  getAll = () => {
    const all = [] as Snapshot[];
    for (const group of this.groups.values()) {
      for (const snapshot of group.values()) {
        all.push(snapshot);
      }
    }
    return all;
  };

  //* client only

  get = (snapshot: SnapshotId) => {
    return this.groups.get(snapshot.group)?.get(snapshot.name);
  };

  getGroups = () => {
    return [...this.groups.entries()];
  };

  getNewSnapshotGroups = () => {
    if (this.cachedNewSnapshots) return this.cachedNewSnapshots;

    const newSnapshots = [] as [string, Map<string, Snapshot>][];
    for (const [groupName, group] of this.groups.entries()) {
      const newGroups = new Map<string, Snapshot>();

      for (const snapshot of group.values()) {
        if ("new" in snapshot) newGroups.set(snapshot.name, snapshot);
      }

      if (newGroups.size) newSnapshots.push([groupName, newGroups]);
    }
    this.cachedNewSnapshots = newSnapshots;
    return newSnapshots;
  };

  newSnapshotCount = () => {
    if (this.cachedNewSnapshots) return this.cachedNewSnapshots.length;

    let count = 0;
    for (const groups of this.groups.values()) {
      for (const snapshot of groups.values()) {
        if ("new" in snapshot) count++;
      }
    }
    return count;
  };
}
