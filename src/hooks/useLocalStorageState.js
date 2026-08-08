import { useCallback, useEffect, useRef, useState } from "react";

/**
 * State mirrored to localStorage. Reads on mount (not during render) so server
 * and client agree on the first paint.
 */
export function useLocalStorageState(key, initialValue) {
  const [value, setValue] = useState(initialValue);
  const hydrated = useRef(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw !== null) {
        const parsed = JSON.parse(raw);
        // Guard against a stored value whose shape no longer matches the code.
        if (Array.isArray(initialValue) === Array.isArray(parsed)) {
          setValue(parsed);
        }
      }
    } catch (e) {
      console.error(`Could not read ${key} from localStorage:`, e);
    }
    hydrated.current = true;
    // initialValue is only a fallback; re-running on a new object would loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    // Don't write the default back over a stored value before it is read.
    if (!hydrated.current) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error(`Could not save ${key} to localStorage:`, e);
    }
  }, [key, value]);

  const reset = useCallback(() => setValue(initialValue), [initialValue]);

  return [value, setValue, reset];
}
