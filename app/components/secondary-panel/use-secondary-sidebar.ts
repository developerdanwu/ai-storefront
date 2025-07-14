import { shallowEqual } from "@xstate/react";
import { useCallback, useMemo } from "react";
import { useLocalStorage } from "usehooks-ts";
import type { SecondarySidebarType } from "./types";

export function useSecondarySidebar() {
  const [value, setValue] = useLocalStorage(
    "secondary-sidebar",
    null as SecondarySidebarType
  );

  const toggle = useCallback(
    (newValue: SecondarySidebarType) => {
      if (shallowEqual(value, newValue)) {
        setValue(null);
      } else {
        setValue(newValue);
      }
    },
    [value, setValue]
  );

  return useMemo(() => {
    return [value, setValue, toggle] as const;
  }, [value, setValue, toggle]);
}
