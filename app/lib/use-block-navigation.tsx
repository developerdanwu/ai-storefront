import { useEffect, useRef } from "react";
import { type BlockerFunction, useBlocker } from "react-router";
import { useDialogStore } from "./dialog-store";

export function useBlockNavigation({
  shouldBlockRouteChange,
  shouldBlockBeforeUnload,
}: {
  shouldBlockRouteChange: BlockerFunction | boolean;
  shouldBlockBeforeUnload: boolean;
}) {
  const { state, proceed, reset } = useBlocker(shouldBlockRouteChange);
  const blockedRef = useRef(false);
  console.log("state", state);
  blockedRef.current = state === "blocked";
  const dialogStore = useDialogStore();
  useEffect(() => {
    if (state === "blocked") {
      dialogStore.trigger.openAlertDialog({
        title: "Unsaved changes",
        description:
          "You have unsaved changes. Are you sure you want to leave?",
        onConfirm: () => {
          proceed();
        },
        onCancel: () => {
          reset();
        },
      });
    }
  }, [state, proceed, reset, dialogStore]);
  useEffect(() => {
    if (shouldBlockBeforeUnload) {
      const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        e.preventDefault();
      };

      window.addEventListener("beforeunload", handleBeforeUnload);

      return () => {
        window.removeEventListener("beforeunload", handleBeforeUnload);
      };
    }
  }, [shouldBlockBeforeUnload]);
}
