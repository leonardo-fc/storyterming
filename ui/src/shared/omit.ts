export const omit = <T, K extends keyof T>(obj: T, ...keys: K[]): Omit<T, K> =>
  keys.reduce(
    (result, key) => {
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete result[key];
      return result;
    },
    { ...obj },
  );
