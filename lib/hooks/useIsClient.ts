import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

// Returns false during SSR and the initial hydration render, then true once
// running on the client — the canonical, setState-in-effect-free replacement
// for an "after mount" flag.
export function useIsClient(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true, // client snapshot
    () => false // server snapshot
  );
}
