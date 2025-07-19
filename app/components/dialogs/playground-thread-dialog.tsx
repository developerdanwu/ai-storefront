import { useConvexAction } from "@convex-dev/react-query";
import { useMutation } from "@tanstack/react-query";
import { useCommandState } from "cmdk";
import { usePaginatedQuery } from "convex-helpers/react";
import { api } from "convex/_generated/api";
import { MessageCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router";
import { toast } from "sonner";
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

export function PlaygroundThreadsActionDialog({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}) {
  const selectedThread = useCommandState((s) => s.value);
  const selectedItemId = useCommandState((s) => s.selectedItemId);
  console.log("SELECTED ITEM ID", selectedThread);
  const dialogStore = useDialogStore();
  const aiStore = useAiStore();
  const { mutate: deleteThread } = useMutation({
    mutationKey: ["delete-playground-thread"],
    mutationFn: useConvexAction(api.product.ai.action.deletePlaygroundThread),
    onMutate: (args: { threadId: string }) => {
      if (selectedThread === args.threadId) {
        aiStore.send({
          type: "setPlaygroundThreadId",
          playgroundThreadId: null,
        });
      }
    },
    onSuccess: () => {
      dialogStore.trigger.closeAlertDialogWithConfirmKeyword();
      toast.success("Thread deleted");
    },
  });

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm">
          Actions
          <kbd
            className={
              "shadow-xs ml-2 text-xs font-medium bg-background-subtle whitespace-nowrap border-secondary border text-background-emphasis font-sans h-min w-min px-1.5 py-0.5 rounded-lg"
            }
          >
            ⌘K
          </kbd>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        onCloseAutoFocus={(e) => e.preventDefault()}
        className="p-0 w-xs"
        align="end"
        side="top"
      >
        <Command>
          <CommandList className="p-2">
            <CommandItem
              onSelect={() => {
                dialogStore.trigger.openAlertDialogWithConfirmKeyword({
                  confirmButtonMutationKeys: [["delete-playground-thread"]],
                  confirmKeyword: "DELETE",
                  title: "Delete thread",
                  disableCloseOnConfirm: true,
                  description: "Are you sure you want to delete this thread?",
                  onConfirm: () => {
                    deleteThread({ threadId: selectedThread });
                  },
                });
              }}
              value="delete-thread"
            >
              Delete thread
              <CommandShortcut>↵</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={() => {}} value="create-thread">
              Create new thread
              <CommandShortcut>↵</CommandShortcut>
            </CommandItem>

            <CommandEmpty className="py-4">No results</CommandEmpty>
          </CommandList>
          <CommandInput placeholder="Search..." />
        </Command>
      </PopoverContent>
    </Popover>
  );
}

const DIALOG_NAME = "playgroundThreadsDialog";

export function PlaygroundThreadsDialog({
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
  const [moreActionsOpen, setMoreActionsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current && !moreActionsOpen) {
      inputRef.current.focus();
    }
  }, [moreActionsOpen]);

  // Fetch all AI threads for the user
  const threads = usePaginatedQuery(
    api.product.ai.query.getPlaygroundThreads,
    {},
    {
      initialNumItems: 20,
    }
  );

  // Set up event listeners for dialog open/close events
  useEffect(() => {
    const openSubscription = store.on("playgroundThreadsDialogOpened", () => {
      setSearchParams((prev) => {
        prev.set("dialog", DIALOG_NAME);
        return prev;
      });
      // Dialog is opened
    });

    const closeSubscription = store.on("playgroundThreadsDialogClosed", () => {
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
    console.log("SELECT", threadId);
    onSelect(threadId);
    store.trigger.closePlaygroundThreadsDialog();
  };

  const handleClose = () => {
    store.trigger.closePlaygroundThreadsDialog();
  };

  return (
    <CommandDialog
      open={isOpen}
      title="Search AI threads"
      className="max-w-2xl"
      onOpenChange={(open) => !open && handleClose()}
    >
      <Command className="rounded-lg border shadow-md">
        <CommandInput
          ref={inputRef}
          placeholder="Search AI threads..."
          value={searchValue}
          onValueChange={setSearchValue}
        />
        <div className="flex">
          <CommandList className="flex-1">
            <CommandEmpty>No AI threads found.</CommandEmpty>
            {threads.results.length > 0 && (
              <CommandGroup heading="AI Threads">
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
          <PlaygroundThreadsActionDialog
            isOpen={moreActionsOpen}
            setIsOpen={setMoreActionsOpen}
          />
        </div>
      </Command>
    </CommandDialog>
  );
}
