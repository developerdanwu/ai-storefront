import { useConvexAction, useConvexQuery } from "@convex-dev/react-query";
import { useMutation } from "@tanstack/react-query";
import { api } from "convex/_generated/api";
import { useNavigate } from "react-router";
import { type Thread, ThreadsList } from "./threads-list";

interface AuthenticatedThreadsProps {
  activeThreadId?: string;
}

export function AuthenticatedThreads({
  activeThreadId,
}: AuthenticatedThreadsProps) {
  const navigate = useNavigate();

  // Get threads from API
  const threadsResult = useConvexQuery(api.ai.query.getThreads, {
    paginationOpts: { numItems: 50, cursor: null },
  });

  const threads: Thread[] = threadsResult?.page || [];
  const threadsLoading = threadsResult === undefined;

  // Create new thread
  const createThread = useMutation({
    mutationFn: useConvexAction(api.ai.action.createThread),
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
    <ThreadsList
      threads={threads}
      isLoading={threadsLoading}
      activeThreadId={activeThreadId}
      onThreadSelect={handleThreadSelect}
      onNewChat={handleNewChat}
      title="Chats"
    />
  );
}
