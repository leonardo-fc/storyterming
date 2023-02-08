import { initTRPC } from '@trpc/server';
import { observable } from '@trpc/server/observable';
import { z } from 'zod';
import { SnapshotsMap } from '~/functions/snapshots';
import type { UpdateEvent } from '~/types';
import { events } from './events';
import { updateSnapshot } from './watch';

const t = initTRPC.create();

const snapshotsMap = new SnapshotsMap();

events.on('change', (update) => {
  switch (update.type) {
    case 'set':
      return snapshotsMap.set(update.data);
    case 'delete':
      return snapshotsMap.delete(update.data);
  }
});

export type AppRouter = typeof appRouter;
export const appRouter = t.router({
  onChange: t.procedure.subscription(() => {
    return observable<UpdateEvent>((emit) => {
      emit.next({ type: 'initial', data: snapshotsMap.getAll() });

      return events.on('change', (event) => {
        emit.next(event);
      });
    });
  }),
  updateSnapshot: t.procedure
    .input(z.object({ name: z.string(), group: z.string() }))
    .mutation(async ({ input: { name, group } }) => {
      return updateSnapshot(name, group);
    }),
});
