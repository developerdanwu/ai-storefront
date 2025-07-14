import { useConvexAction } from "@convex-dev/react-query";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@workos-inc/authkit-react";
import { api } from "convex/_generated/api";
import { Plus, Trash } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";
import { SidebarHeader as SidebarHeaderOriginal } from "~/components/ui/sidebar";
import { useDialogStore } from "~/lib/dialog-store";
import { useAnonymousUserId } from "~/lib/hooks/useAnonymousUserId";
import { ROUTES } from "~/lib/routes";
import { cn } from "~/lib/utils";
import { EmptyThreads } from "~/routes/_providers._shell/_components/empty-threads";

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuTrigger,
} from "./ui/context-menu";
import { IconButton } from "./ui/icon-button";
import { Input } from "./ui/input";
import { LoadingSpinner } from "./ui/loading-spinner";
import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "./ui/sidebar";

export interface Thread {
  _id: string;
  title?: string;
  _creationTime: number;
}

export function SidebarHeader({ children }: { children: React.ReactNode }) {
  return (
    <SidebarHeaderOriginal>
      <div className="flex items-center justify-between my-2">
        <div className="text-lg font-semibold">Dan's Workspace</div>
        <IconButton asChild variant="ghost" size="sm">
          <Link to={ROUTES.home}>
            <Plus />
          </Link>
        </IconButton>
      </div>
      {children}
    </SidebarHeaderOriginal>
  );
}

function ThreadItemButton({
  onThreadSelect,
  handleDelete,
  thread,
  activeThreadId,
  menuOpen,
}: {
  onThreadSelect: (threadId: string) => void;
  handleDelete: () => void;
  thread: Thread;
  activeThreadId: string | undefined;
  menuOpen: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <AnimatePresence>
      <SidebarMenuButton
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => onThreadSelect(thread._id)}
        isActive={activeThreadId === thread._id}
        className={cn(
          "justify-start group/item w-0 h-10 flex-[1_1_0px] flex text-sm truncate text-left",
          menuOpen && "bg-muted"
        )}
      >
        <span className="font-medium w-0 flex-[1_1_0px] text-sm truncate block text-left">
          {thread.title}
        </span>

        {hovered ? (
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              handleDelete();
            }}
            asChild
            variant="ghost"
            size="sm"
          >
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Trash />
            </motion.button>
          </IconButton>
        ) : null}
      </SidebarMenuButton>
    </AnimatePresence>
  );
}

function ThreadItem({
  thread,
  onThreadSelect,
  activeThreadId,
}: {
  thread: Thread;
  onThreadSelect: (threadId: string) => void;
  activeThreadId: string | undefined;
}) {
  const { user } = useAuth();
  const [anonymousUserId] = useAnonymousUserId();
  const [menuOpen, setMenuOpen] = useState(false);
  const dialogStore = useDialogStore();
  const navigate = useNavigate();
  const deleteAiThread = useMutation({
    mutationKey: ["archive-thread", thread._id],
    onMutate: async ({ threadId }: { threadId: string }) => {
      if (threadId === activeThreadId) {
        await navigate(ROUTES.home);
      }
    },
    onSuccess: async () => {
      toast.success("Thread deleted");
      dialogStore.trigger.closeAlertDialog();
    },
    onError: () => {
      toast.error("Failed to delete thread");
    },
    mutationFn: useConvexAction(api.ai.action.deleteAiThread),
  });

  const deleteAnonymousAiThread = useMutation({
    mutationKey: ["delete-anonymous-thread", thread._id],
    onMutate: async ({ threadId }: { threadId: string }) => {
      if (threadId === activeThreadId) {
        await navigate(ROUTES.home);
      }
    },
    onSuccess: async () => {
      toast.success("Thread deleted");
      dialogStore.trigger.closeAlertDialog();
    },
    onError: () => {
      toast.error("Failed to delete thread");
    },
    mutationFn: useConvexAction(api.ai.action.deleteAnonymousAiThread),
  });

  const handleDelete = () => {
    dialogStore.trigger.openAlertDialog({
      title: "Delete thread",
      disableCloseOnConfirm: true,
      description: "Are you sure you want to delete this thread?",
      confirmButtonMutationKeys: [["archive-thread", thread._id]],
      onConfirm: () => {
        if (user) {
          deleteAiThread.mutate({
            threadId: thread._id,
          });
        } else {
          deleteAnonymousAiThread.mutate({
            threadId: thread._id,
            anonymousUserId,
          });
        }
      },
    });
  };

  return (
    <SidebarMenuItem key={thread._id} className="w-full flex">
      <ContextMenu onOpenChange={setMenuOpen}>
        <ContextMenuTrigger asChild>
          <ThreadItemButton
            handleDelete={handleDelete}
            thread={thread}
            activeThreadId={activeThreadId}
            menuOpen={menuOpen}
            onThreadSelect={onThreadSelect}
          />
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuGroup>
            <ContextMenuItem
              onSelect={() => {
                handleDelete();
              }}
              variant="destructive"
            >
              Delete thread
            </ContextMenuItem>
          </ContextMenuGroup>
        </ContextMenuContent>
      </ContextMenu>
    </SidebarMenuItem>
  );
}

export function ThreadsList({
  threads,
  isLoading,
  activeThreadId,
  query,
  onQueryChange,
  onThreadSelect,
}: {
  threads: Thread[];
  isLoading: boolean;
  activeThreadId?: string;
  onThreadSelect: (threadId: string) => void;
  query: string;
  onQueryChange: (query: string) => void;
}) {
  return (
    <>
      <SidebarHeader>
        <Input
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          className="mb-2"
        />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {isLoading ? (
                <div className="flex justify-center items-center text-center text-muted-foreground">
                  <LoadingSpinner />
                </div>
              ) : null}

              {threads.map((thread) => (
                <ThreadItem
                  key={thread._id}
                  thread={thread}
                  onThreadSelect={onThreadSelect}
                  activeThreadId={activeThreadId}
                />
              ))}

              {!isLoading && threads.length === 0 && <EmptyThreads />}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </>
  );
}
