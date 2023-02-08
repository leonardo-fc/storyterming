import { readable, type Subscriber } from 'svelte/store';
import { modalStore } from './modalStore';

export function withLoading<TArgs extends unknown[]>(
  fn: (...args: TArgs) => unknown,
) {
  let setLoading: Subscriber<boolean>;
  const isLoading = readable(false, (v) => {
    setLoading = v;
  });

  async function newFn(...args: TArgs) {
    setLoading(true);
    try {
      await fn(...args);
    } catch (error) {
      modalStore.set(`${error}`);
    } finally {
      setLoading(false);
    }
  }

  return { isLoading, fn: newFn };
}
