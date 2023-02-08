import chokidar from "chokidar";
import fs from "node:fs/promises";
import { basename, dirname, join, relative } from "node:path";
import { events } from "./events";
import { args } from "./cli";
import { differenceInMilliseconds } from "date-fns";

const { snapshotsDir } = args;

let throttleData: { event: string; path: string; date: Date } | undefined;

export function startWatch() {
  chokidar.watch(snapshotsDir, { depth: 1 }).on("all", (event, path) => {
    (async () => {
      if (event === "add" || event === "change" || event === "unlink") {
        if (path.endsWith(".DS_Store")) return;

        if (
          throttleData?.event === event &&
          throttleData.path === path &&
          differenceInMilliseconds(Date.now(), throttleData.date) <= 150
        ) {
          return;
        } else {
          throttleData = { event, path, date: new Date() };
        }

        const [currentPath, newPath] = path.endsWith(".new")
          ? [path.replace(/.new$/, ""), path]
          : [path, `${path}.new`];

        const [current, _new] = await Promise.all([
          readFileIfExist(currentPath),
          readFileIfExist(newPath),
        ]);

        const snapshot = (() => {
          if (current != null && _new != null) return { current, new: _new };
          if (current != null) return { current };
          if (_new != null) return { new: _new };
        })();

        const name = basename(currentPath);

        const dir = dirname(relative(snapshotsDir, currentPath));
        const group = dir === "." ? "" : dir;

        events.emit(
          "change",
          !snapshot
            ? { type: "delete", data: { name, group } }
            : { type: "set", data: { name, group, ...snapshot } },
        );
      }
    })().catch(console.error);
  });
}

export const updateSnapshot = (name: string, group: string) => {
  return fs.rename(
    join(snapshotsDir, group, `${name}.new`),
    join(snapshotsDir, group, name),
  );
};

const readFileIfExist = async (path: string) => {
  return fs.readFile(path, "utf8").catch(() => undefined);
};
