import { EventEmitter, on } from "node:events";
import type { UpdateEvent } from "~/shared/types";

type Event = {
  change: UpdateEvent;
};
type RemoveListener = () => void;

const ee = new EventEmitter();

export const events = {
  emit<T extends keyof Event>(
    ...[event, data]: Event[T] extends undefined
      ? [event: T]
      : [event: T, data: Event[T]]
  ) {
    ee.emit(event, data);
  },

  on<T extends keyof Event>(
    event: T,
    listener: (data: Event[T]) => void,
  ): RemoveListener {
    ee.on(event, listener);
    return () => {
      ee.off(event, listener);
    };
  },

  async *iterate<T extends keyof Event>(
    event: T,
    { signal }: { signal?: AbortSignal },
  ) {
    for await (const events of on(ee, event, { signal })) {
      for (event of events) {
        yield event as unknown as Event[T];
      }
    }
  },
};
