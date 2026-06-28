import { useSyncExternalStore } from "react";

const MD_BREAKPOINT = 768;
const QUERY = `(max-width: ${MD_BREAKPOINT - 1}px)`;

function subscribe(onChange: () => void): () => void {
  const mql = window.matchMedia(QUERY);
  mql.addEventListener("change", onChange);
  return () => mql.removeEventListener("change", onChange);
}

export function useIsMobile(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches, // client snapshot
    () => false // server snapshot (assume desktop during SSR)
  );
}
