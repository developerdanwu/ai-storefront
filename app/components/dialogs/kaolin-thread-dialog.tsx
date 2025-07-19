import { useConvexAction } from "@convex-dev/react-query";
import { useMutation } from "@tanstack/react-query";
import { useSelector } from "@xstate/react";
import { useCommandState } from "cmdk";
import { usePaginatedQuery } from "convex-helpers/react";
import { api } from "convex/_generated/api";
import { MessageCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router";
import { toast } from "sonner";
import { CommandActionDialog } from "~/components/ui/command";
import { useDialogStore } from "~/lib/dialog-store";
import { useAiStore } from "../secondary-panel/ai/ai-store";
import { Button } from "../ui/button";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";

export function KaolinThreadsActionDialog({
  mainInputRef,
}: {
  mainInputRef: React.RefObject<HTMLInputElement>;
}) {
  const aiStore = useAiStore();
  const dialogStore = useDialogStore();
  const kaolinThreadId = useSelector(
    aiStore,
    (state) => state.context.kaolinThreadId
  );
  const { mutate: deleteThread } = useMutation({
    mutationKey: ["delete-kaolin-thread"],
    mutationFn: useConvexAction(api.product.ai.action.deleteKaolinThread),
    onMutate: ({ threadId }: { threadId: string }) => {
      if (kaolinThreadId === threadId) {
        aiStore.send({
          type: "setKaolinThreadId",
          kaolinThreadId: null,
        });
      }
    },
    onSuccess: () => {
      dialogStore.trigger.closeAlertDialogWithConfirmKeyword();
      toast.success("Thread deleted");
    },
  });
  const selectedItemId = useCommandState((s) => s.value);
  return (
    <CommandActionDialog
      mainInputRef={mainInputRef}
      commands={[
        {
          label: "Create new thread",
          value: "create-thread",
          onSelect: () => {
            console.log("CREATE THREAD");
          },
        },
        ...(selectedItemId
          ? [
              {
                label: "Delete thread",
                value: "delete-thread",
                onSelect: () => {
                  dialogStore.trigger.openAlertDialogWithConfirmKeyword({
                    confirmKeyword: "DELETE",
                    disableCloseOnConfirm: true,
                    confirmButtonMutationKeys: [["delete-kaolin-thread"]],
                    title: "Delete thread",
                    description: "Are you sure you want to delete this thread?",
                    onConfirm: () => {
                      deleteThread({
                        threadId: selectedItemId,
                      });
                    },
                  });
                },
              },
            ]
          : []),
      ]}
    />
  );
}

const DIALOG_NAME = "kaolinThreadsDialog";

export function KaolinThreadsDialog({
  onSelect,
  onClose,
}: {
  onSelect: (threadId: string) => void;
  onClose: () => void;
}) {
  const [searchValue, setSearchValue] = useState("");
  const store = useDialogStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const isOpen = searchParams.get("dialog") === DIALOG_NAME;
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch all Kaolin AI threads for the user
  const threads = usePaginatedQuery(
    api.product.ai.query.getKaolinThreads,
    {},
    {
      initialNumItems: 20,
    }
  );

  // Set up event listeners for dialog open/close events
  useEffect(() => {
    const openSubscription = store.on("kaolinThreadsDialogOpened", () => {
      setSearchParams((prev) => {
        prev.set("dialog", DIALOG_NAME);
        return prev;
      });
      // Dialog is opened
    });

    const closeSubscription = store.on("kaolinThreadsDialogClosed", () => {
      setSearchParams((prev) => {
        prev.delete("dialog");
        return prev;
      });
      // Reset search when closing
      setSearchValue("");
      onClose();
    });

    return () => {
      openSubscription.unsubscribe();
      closeSubscription.unsubscribe();
    };
  }, [store, onClose]);

  const handleSelect = (threadId: string) => {
    onSelect(threadId);
    store.trigger.closeKaolinThreadsDialog();
  };

  const handleClose = () => {
    store.trigger.closeKaolinThreadsDialog();
  };

  return (
    <CommandDialog
      open={isOpen}
      title="Search Kaolin AI threads"
      className="max-w-2xl"
      onOpenChange={(open) => !open && handleClose()}
    >
      <Command className="rounded-lg border shadow-md">
        <CommandInput
          ref={inputRef}
          placeholder="Search Kaolin AI threads..."
          value={searchValue}
          onValueChange={setSearchValue}
        />
        <div className="flex">
          <CommandList className="flex-1">
            <CommandEmpty>No Kaolin AI threads found.</CommandEmpty>
            {threads.results.length > 0 && (
              <CommandGroup heading="Kaolin AI Threads">
                {threads.results.map((thread) => (
                  <CommandItem
                    key={thread._id}
                    value={thread._id}
                    keywords={thread.title?.split(" ") ?? []}
                    onSelect={() => handleSelect(thread._id)}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <MessageCircle className="h-4 w-4 shrink-0" />
                    <span>{thread.title}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </div>

        <div className="flex justify-end p-2">
          <Button variant={"ghost"} size={"sm"}>
            Select thread
            <kbd
              className={
                "shadow-xs ml-2 text-xs font-medium bg-background-subtle whitespace-nowrap border-secondary border text-background-emphasis font-sans h-min w-min px-1.5 py-0.5 rounded-lg"
              }
            >
              ↵
            </kbd>
          </Button>
          <KaolinThreadsActionDialog mainInputRef={inputRef} />
        </div>
      </Command>
    </CommandDialog>
  );
}
