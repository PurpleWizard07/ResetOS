import { useCallback, useSyncExternalStore } from "react";

/**
 * Reads the match synchronously on the client, so the first paint already has
 * the right layout instead of rendering desktop and snapping to mobile.
 */
export function useMediaQuery(query) {
  const subscribe = useCallback(
    (onChange) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    [query]
  );

  const getSnapshot = useCallback(
    () => window.matchMedia(query).matches,
    [query]
  );

  // Server render has no viewport; assume desktop and let hydration correct it.
  const getServerSnapshot = useCallback(() => false, []);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
