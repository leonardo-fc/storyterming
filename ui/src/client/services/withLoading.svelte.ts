import { modal } from "./modal.svelte";

export function withLoading<TArgs extends unknown[]>(
  fn: (...args: TArgs) => unknown,
) {
  let isLoading = $state(false);

  async function newFn(...args: TArgs) {
    isLoading = true;
    try {
      await fn(...args);
    } catch (error) {
      modal.show(error instanceof Error ? error.message : String(error));
    } finally {
      isLoading = false;
    }
  }

  return [() => isLoading, newFn] as const;
}
