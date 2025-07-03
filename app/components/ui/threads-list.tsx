import { MessageSquare } from "lucide-react";
import { Link } from "react-router";
import { Button } from "./button";
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
                <SidebarMenuItem key={thread._id} className="">
                  <SidebarMenuButton
                    onClick={() => onThreadSelect(thread._id)}
                    isActive={activeThreadId === thread._id}
                    className="justify-start h-auto py-3"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {thread.title}
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
