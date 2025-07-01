import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAction, useConvexQuery } from "@convex-dev/react-query";
import { useMutation } from "@tanstack/react-query";
import { api } from "convex/_generated/api";
import { MessageSquare, Plus } from "lucide-react";
import { Outlet, useNavigate, useParams } from "react-router";
import { Button } from "~/components/ui/button";

export default function ChatLayoutRoute() {
  const { signOut } = useAuthActions();
  const navigate = useNavigate();
  const { threadId } = useParams();

  // Get threads from API
  const threadsResult = useConvexQuery(api.ai.getThreads, {
    paginationOpts: { numItems: 50, cursor: null },
  });

  const threads = threadsResult?.page || [];
  const threadsLoading = threadsResult === undefined;

  // Create new thread
  const createThread = useMutation({
    mutationFn: useConvexAction(api.ai.createThread),
    onSuccess: (result) => {
      if (result && typeof result === "object" && "threadId" in result) {
        navigate(`/chat/${result.threadId}`);
      }
    },
  });

  const handleNewChat = () => {
    navigate("/chat");
  };

  const handleThreadSelect = (selectedThreadId: string) => {
    navigate(`/chat/${selectedThreadId}`);
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-80 border-r border-border flex flex-col">
        {/* Sidebar Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold">Chats</h1>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleNewChat}
              className="gap-2"
            >
              <Plus size={16} />
              New Chat
            </Button>
          </div>
        </div>

        {/* Threads List */}
        <div className="flex-1 overflow-y-auto">
          {threadsLoading && (
            <div className="p-4 text-center text-muted-foreground">
              <p className="text-sm">Loading chats...</p>
            </div>
          )}

          {threads.map((thread) => (
            <button
              key={thread._id}
              onClick={() => handleThreadSelect(thread._id)}
              className={`w-full p-4 text-left hover:bg-muted/50 border-b border-border/50 transition-colors ${
                threadId === thread._id ? "bg-muted" : ""
              }`}
            >
              <div className="flex items-start gap-3">
                <MessageSquare
                  size={16}
                  className="mt-1 text-muted-foreground"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">
                    {thread.title || "New Chat"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(thread._creationTime).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </button>
          ))}

          {!threadsLoading && threads.length === 0 && (
            <div className="p-4 text-center text-muted-foreground">
              <MessageSquare size={48} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">No chats yet</p>
              <p className="text-xs">Start a new conversation</p>
            </div>
          )}
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-border">
          <Button
            variant="outline"
            size="sm"
            onClick={() => signOut()}
            className="w-full"
          >
            Sign Out
          </Button>
        </div>
      </div>

      {/* Main Chat Area - Outlet for nested routes */}
      <div className="flex-1 overflow-hidden">
        <Outlet context={{ createThread }} />
      </div>
    </div>
  );
}
