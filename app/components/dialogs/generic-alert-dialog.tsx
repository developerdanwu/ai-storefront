import { matchMutation, useIsMutating } from "@tanstack/react-query";
import { shallowEqual } from "@xstate/react";
import { useSelector } from "@xstate/store/react";
import { Loader2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useDialogStore } from "~/lib/dialog-store";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";

export function GenericAlertDialog() {
  const [dialogContent, setDialogContent] = useState<{
    title: string;
    description: React.ReactNode;
    onConfirm: () => void;
    onCancel?: () => void;
    confirmText?: string;
    cancelText?: string;
    // used for loading indicator
    confirmButtonMutationKeys?: string[][];
    cancelButtonMutationKeys?: string[][];
    disableCloseOnConfirm?: boolean;
  } | null>(null);
  const confirmButtonMutations = useIsMutating({
    predicate: (mutation) => {
      if (!dialogContent?.confirmButtonMutationKeys) {
        return false;
      }

      return dialogContent.confirmButtonMutationKeys.some((key) =>
        matchMutation(
          {
            mutationKey: key,
          },
          mutation
        )
      );
    },
  });

  const cancelButtonMutations = useIsMutating({
    predicate: (mutation) => {
      if (!dialogContent?.cancelButtonMutationKeys) {
        return false;
      }

      return dialogContent.cancelButtonMutationKeys.some((key) =>
        matchMutation(
          {
            mutationKey: key,
          },
          mutation
        )
      );
    },
  });

  const isCancelButtonLoading = cancelButtonMutations > 0;
  const isConfirmButtonLoading = confirmButtonMutations > 0;
  const store = useDialogStore();
  const open = useSelector(
    store,
    (state) => state.context.dialog === "alert",
    shallowEqual
  );

  useEffect(() => {
    const open = store.on("alertDialogOpened", (event) => {
      setDialogContent({
        confirmButtonMutationKeys: event.confirmButtonMutationKeys ?? [],
        cancelButtonMutationKeys: event.cancelButtonMutationKeys ?? [],
        title: event.title,
        description: event.description,
        onConfirm: event.onConfirm,
        onCancel: event.onCancel,
        confirmText: event.confirmText,
        cancelText: event.cancelText,
        disableCloseOnConfirm: event.disableCloseOnConfirm,
      });
    });

    const close = store.on("alertDialogClosed", () => {
      setDialogContent(null);
    });

    return () => {
      open.unsubscribe();
      close.unsubscribe();
    };
  }, [store]);

  const handleConfirm = () => {
    dialogContent?.onConfirm();
    if (!dialogContent?.disableCloseOnConfirm) {
      store.trigger.closeAlertDialog();
    }
  };

  const handleCancel = () => {
    if (dialogContent?.onCancel) {
      dialogContent.onCancel();
    }
    store.trigger.closeAlertDialog();
  };

  if (!dialogContent) return null;

  return (
    <AlertDialog open={open}>
      <AlertDialogContent
        onEscapeKeyDown={(e) => {
          e.stopPropagation();
        }}
      >
        <AlertDialogHeader>
          <AlertDialogTitle>{dialogContent.title}</AlertDialogTitle>
          <AlertDialogDescription>
            {dialogContent.description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            onClick={handleCancel}
            disabled={isConfirmButtonLoading || isCancelButtonLoading}
          >
            {isCancelButtonLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                {dialogContent.cancelText ?? "Cancel"}
              </div>
            ) : (
              dialogContent.cancelText ?? "Cancel"
            )}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isConfirmButtonLoading || isCancelButtonLoading}
          >
            {isConfirmButtonLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                {dialogContent.confirmText ?? "Continue"}
              </div>
            ) : (
              dialogContent.confirmText ?? "Continue"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
