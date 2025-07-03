import { MessageSquare, Trash } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import { useDialogStore } from "~/lib/dialog-store";
import { cn } from "~/lib/utils";
import { Button } from "./button";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuTrigger,
} from "./context-menu";
import { IconButton } from "./icon-button";
import { Input } from "./input";
import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "./sidebar";

export interface Thread {
  _id: string;
  title?: string;
  _creationTime: number;
}

interface ThreadsListProps {
  threads: Thread[];
  isLoading: boolean;
  activeThreadId?: string;
  onThreadSelect: (threadId: string) => void;
  query: string;
  onQueryChange: (query: string) => void;
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
  const [menuOpen, setMenuOpen] = useState(false);
  const dialogStore = useDialogStore();

  return (
    <SidebarMenuItem key={thread._id} className="w-full flex">
      <ContextMenu onOpenChange={setMenuOpen}>
        <ContextMenuTrigger asChild>
          <SidebarMenuButton
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
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                dialogStore.trigger.openAlertDialog({
                  title: "Delete thread",
                  description: "Are you sure you want to delete this thread?",
                  onConfirm: () => {
                    console.log("delete");
                  },
                });
              }}
              className="group-hover/item:visible opacity-0 group-hover/item:opacity-100 transition-all duration-500 absolute group-hover/item:relative invisible"
              asChild
              variant="ghost"
              size="sm"
            >
              <Trash />
            </IconButton>
          </SidebarMenuButton>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuGroup>
            <ContextMenuItem
              onSelect={() => {
                dialogStore.trigger.openAlertDialog({
                  title: "Delete thread",
                  description: "Are you sure you want to delete this thread?",
                  onConfirm: () => {
                    console.log("delete");
                  },
                });
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
}: ThreadsListProps) {
  return (
    <>
      <SidebarHeader>
        <Button asChild className="mb-2">
          <Link to="/">New chat</Link>
        </Button>
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
              {isLoading && (
                <div className="p-4 text-center text-muted-foreground">
                  <p className="text-sm">Loading chats...</p>
                </div>
              )}

              {threads.map((thread) => (
                <ThreadItem
                  key={thread._id}
                  thread={thread}
                  onThreadSelect={onThreadSelect}
                  activeThreadId={activeThreadId}
                />
              ))}

              {!isLoading && threads.length === 0 && (
                <div className="p-4 text-center text-muted-foreground">
                  <MessageSquare
                    size={48}
                    className="mx-auto mb-2 opacity-50"
                  />
                  <p className="text-sm">No chats yet</p>
                  <p className="text-xs">Start a new conversation</p>
                </div>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </>
  );
}
