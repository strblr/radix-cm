import { useInsertionEffect, useRef } from "react";

export function useEvent<T extends (...args: any[]) => any>(fn: T) {
  const ref = useRef<T>(fn);

  useInsertionEffect(() => {
    ref.current = fn;
  }, [fn]);

  return useRef(((...args) => (0, ref.current)(...args)) as T).current;
}
