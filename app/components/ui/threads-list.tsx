import { MessageSquare, Plus } from "lucide-react";
import { Button } from "./button";
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
  onNewChat: () => void;
  title?: string;
}

export function ThreadsList({
  threads,
  isLoading,
  activeThreadId,
  onThreadSelect,
  onNewChat,
  title = "Chats",
}: ThreadsListProps) {
  return (
    <>
      <SidebarHeader>
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">{title}</h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={onNewChat}
            className="gap-2"
          >
            <Plus size={16} />
            New Chat
          </Button>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {isLoading && (
                <div className="p-4 text-center text-muted-foreground">
                  <p className="text-sm">Loading chats...</p>
                </div>
              )}

              {threads.map((thread) => (
                <SidebarMenuItem key={thread._id}>
                  <SidebarMenuButton
                    onClick={() => onThreadSelect(thread._id)}
                    isActive={activeThreadId === thread._id}
                    className="w-full justify-start"
                  >
                    <MessageSquare size={16} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {thread.title || "New Chat"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(thread._creationTime).toLocaleDateString()}
                      </p>
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
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
