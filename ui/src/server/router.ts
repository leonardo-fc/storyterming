import { initTRPC } from "@trpc/server";
import { z } from "zod";
import { SnapshotsMap } from "~/shared/snapshots";
import { events } from "./events";
import { updateSnapshot } from "./watch";
import type { UpdateEvent } from "~/shared/types";

const t = initTRPC.create();

const snapshotsMap = new SnapshotsMap();

events.on("change", (update) => {
  switch (update.type) {
    case "set":
      snapshotsMap.set(update.data);
      break;
    case "delete":
      snapshotsMap.delete(update.data);
      break;
  }
});

export type AppRouter = typeof appRouter;
export const appRouter = t.router({
  onChange: t.procedure.subscription(async function* ({ signal }) {
    yield {
      type: "initial",
      data: snapshotsMap.getAll(),
    } satisfies UpdateEvent;

    for await (const event of events.iterate("change", { signal })) {
      yield event;
    }
  }),

  updateSnapshot: t.procedure
    .input(z.object({ name: z.string(), group: z.string() }))
    .mutation(async ({ input: { name, group } }) => {
      return updateSnapshot(name, group);
    }),
});
