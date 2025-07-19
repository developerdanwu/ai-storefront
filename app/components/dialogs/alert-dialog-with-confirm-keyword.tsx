import { useStore } from "@tanstack/react-form";
import { matchMutation, useIsMutating } from "@tanstack/react-query";
import { shallowEqual } from "@xstate/react";
import { useSelector } from "@xstate/store/react";
import { Loader2 } from "lucide-react";
import React, { forwardRef, useEffect, useState } from "react";
import z from "zod";
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
import { Input } from "../ui/input";
import { useAppForm } from "../ui/tanstack-form";

type DialogContent = {
  title: string;
  description: React.ReactNode;
  onConfirm: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  confirmKeyword: string;
  // used for loading indicator
  confirmButtonMutationKeys?: string[][];
  cancelButtonMutationKeys?: string[][];
  disableCloseOnConfirm?: boolean;
};

const DialogContent = forwardRef<
  HTMLFormElement,
  { dialogContent: DialogContent }
>(function DialogContent({ dialogContent, ...rest }, ref) {
  const store = useDialogStore();
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
  const formSchema = z.object({
    confirmKeyword: z.literal(dialogContent.confirmKeyword),
  });
  const isCancelButtonLoading = cancelButtonMutations > 0;
  const isConfirmButtonLoading = confirmButtonMutations > 0;
  const form = useAppForm({
    validators: {
      onMount: formSchema,
      onChange: formSchema,
    },
    defaultValues: {
      confirmKeyword: "",
    },
    onSubmit: () => {
      dialogContent?.onConfirm();
      if (!dialogContent?.disableCloseOnConfirm) {
        store.trigger.closeAlertDialog();
      }
      form.reset();
    },
  });
  const isFormValid = useStore(form.store, (state) => state.isValid);
  const handleCancel = () => {
    if (dialogContent?.onCancel) {
      dialogContent.onCancel();
    } else {
      store.trigger.closeAlertDialog();
    }
  };

  return (
    <form
      ref={ref}
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      {...rest}
    >
      <form.AppForm>
        <AlertDialogHeader>
          <AlertDialogTitle>{dialogContent.title}</AlertDialogTitle>
          <AlertDialogDescription>
            {dialogContent.description}
            <form.AppField
              name="confirmKeyword"
              children={(field) => (
                <field.FormItem className="py-2">
                  <field.FormLabel>
                    Type{" "}
                    <span className="font-bold">
                      {dialogContent.confirmKeyword}
                    </span>{" "}
                    to confirm
                  </field.FormLabel>
                  <field.FormControl>
                    <Input
                      placeholder="confirm keyword"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                    />
                  </field.FormControl>
                </field.FormItem>
              )}
            />
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
            type="submit"
            disabled={
              isConfirmButtonLoading || isCancelButtonLoading || !isFormValid
            }
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
      </form.AppForm>
    </form>
  );
});

DialogContent.displayName = "DialogContent";

export function AlertDialogWithConfirmKeyword() {
  const [dialogContent, setDialogContent] = useState<DialogContent | null>(
    null
  );

  const store = useDialogStore();
  const open = useSelector(
    store,
    (state) => state.context.dialog === "alertWithConfirmKeyword",
    shallowEqual
  );

  useEffect(() => {
    const open = store.on("alertDialogWithConfirmKeywordOpened", (event) => {
      setDialogContent({
        confirmKeyword: event.confirmKeyword,
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

    const close = store.on("alertDialogWithConfirmKeywordClosed", () => {
      setDialogContent(null);
    });

    return () => {
      open.unsubscribe();
      close.unsubscribe();
    };
  }, [store]);

  if (!dialogContent) return null;

  return (
    <AlertDialog open={open}>
      <AlertDialogContent
        asChild
        onEscapeKeyDown={(e) => {
          e.stopPropagation();
        }}
      >
        <DialogContent
          dialogContent={dialogContent}
          key={JSON.stringify(dialogContent)}
        />
      </AlertDialogContent>
    </AlertDialog>
  );
}
