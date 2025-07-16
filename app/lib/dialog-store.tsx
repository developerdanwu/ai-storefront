import { createStore } from "@xstate/store";
import React, { createContext, useContext } from "react";

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
    alertDialogWithConfirmKeywordOpened: (payload: {
      confirmKeyword: string;
      onConfirm: () => void;
      onCancel?: () => void;
      title: string;
      description: React.ReactNode;
      confirmText?: string;
      cancelText?: string;
      disableCloseOnConfirm?: boolean;
      confirmButtonMutationKeys?: string[][];
      cancelButtonMutationKeys?: string[][];
    }) => {},
    alertDialogWithConfirmKeywordClosed: () => {},
    createAgentPersonaDialogOpened: () => {},
    createAgentPersonaDialogClosed: () => {},
    playgroundThreadsDialogOpened: () => {},
    playgroundThreadsDialogClosed: () => {},
    kaolinThreadsDialogOpened: () => {},
    kaolinThreadsDialogClosed: () => {},
  },
  context: {
    dialog: undefined as "alert" | "alertWithConfirmKeyword" | undefined,
  },
  on: {
    openAlertDialogWithConfirmKeyword: (
      context,
      props: {
        confirmKeyword?: string;
        onConfirm: () => void;
        onCancel?: () => void;
        title: string;
        description: React.ReactNode;
        confirmText?: string;
        cancelText?: string;
        disableCloseOnConfirm?: boolean;
        confirmButtonMutationKeys?: string[][];
        cancelButtonMutationKeys?: string[][];
      },
      { emit }
    ) => {
      emit.alertDialogWithConfirmKeywordOpened({
        confirmKeyword: props.confirmKeyword ?? "DELETE",
        onConfirm: props.onConfirm,
        onCancel: props.onCancel,
        title: props.title,
        description: props.description,
        confirmText: props.confirmText,
        cancelText: props.cancelText,
        disableCloseOnConfirm: props.disableCloseOnConfirm,
        confirmButtonMutationKeys: props.confirmButtonMutationKeys,
        cancelButtonMutationKeys: props.cancelButtonMutationKeys,
      });
      return { ...context, dialog: "alertWithConfirmKeyword" as const };
    },
    closeAlertDialogWithConfirmKeyword: (context, _props, { emit }) => {
      emit.alertDialogWithConfirmKeywordClosed();
      return { ...context, dialog: undefined };
    },
    openPlaygroundThreadsDialog: (context, _props, { emit }) => {
      emit.playgroundThreadsDialogOpened();
      return { ...context };
    },
    closePlaygroundThreadsDialog: (context, _props, { emit }) => {
      emit.playgroundThreadsDialogClosed();
      return { ...context };
    },
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
    openCreateAgentPersonaDialog: (context, _props, { emit }) => {
      emit.createAgentPersonaDialogOpened();
      return { ...context };
    },
    closeCreateAgentPersonaDialog: (context, _props, { emit }) => {
      emit.createAgentPersonaDialogClosed();
      return { ...context };
    },
    openKaolinThreadsDialog: (context, _props, { emit }) => {
      emit.kaolinThreadsDialogOpened();
      return { ...context };
    },
    closeKaolinThreadsDialog: (context, _props, { emit }) => {
      emit.kaolinThreadsDialogClosed();
      return { ...context };
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
