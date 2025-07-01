import { createStore } from "@xstate/store";
import React, { createContext, useContext } from "react";

export type DialogStoreEvents =
  | {
      type: "alertDialogOpened";
      title: string;
      description: React.ReactNode;
      onConfirm: () => void;
      onCancel?: () => void;
      confirmText?: string;
      cancelText?: string;
      disableCloseOnConfirm?: boolean;
      confirmButtonMutationKeys?: string[][];
      cancelButtonMutationKeys?: string[][];
    }
  | { type: "alertDialogClosed" };

export type DialogStoreActions =
  | {
      type: "openAlertDialog";
      title: string;
      description: React.ReactNode;
      onConfirm: () => void;
      onCancel?: () => void;
      confirmText?: string;
      cancelText?: string;
    }
  | { type: "closeAlertDialog" };

const dialogStore = createStore({
  emits: {
    alertDialogOpened: (payload: {
      confirmButtonMutationKeys?: string[][];
      cancelButtonMutationKeys?: string[][];
      title: string;
      description: React.ReactNode;
      onConfirm: () => void;
      onCancel?: () => void;
      confirmText?: string;
      cancelText?: string;
      disableCloseOnConfirm?: boolean;
    }) => {},
    alertDialogClosed: () => {},
  },
  context: {
    dialog: undefined as
      | "alert"
      | "interactiveMessageDialog"
      | "aiThreadsDialog"
      | undefined,
  },
  on: {
    openAlertDialog: (
      context,
      props: {
        confirmButtonMutationKeys?: string[][];
        cancelButtonMutationKeys?: string[][];
        title: string;
        description: React.ReactNode;
        onConfirm: () => void;
        onCancel?: () => void;
        confirmText?: string;
        cancelText?: string;
        disableCloseOnConfirm?: boolean;
      },
      { emit }
    ) => {
      emit.alertDialogOpened({
        title: props.title,
        description: props.description,
        onConfirm: props.onConfirm,
        onCancel: props.onCancel,
        confirmText: props.confirmText,
        cancelText: props.cancelText,
        disableCloseOnConfirm: props.disableCloseOnConfirm,
        confirmButtonMutationKeys: props.confirmButtonMutationKeys,
        cancelButtonMutationKeys: props.cancelButtonMutationKeys,
      });
      return { ...context, dialog: "alert" as const };
    },
    closeAlertDialog: (context, _props, { emit }) => {
      emit.alertDialogClosed();
      return { ...context, dialog: undefined };
    },
  },
});

const DialogStoreContext = createContext(dialogStore);

export function DialogStoreContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DialogStoreContext.Provider value={dialogStore}>
      {children}
    </DialogStoreContext.Provider>
  );
}

export function useDialogStore() {
  const store = useContext(DialogStoreContext);
  if (!store) {
    throw new Error("useDialogStore must be used within a DialogStoreContext");
  }
  return store;
}
