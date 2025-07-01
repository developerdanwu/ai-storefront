import { useConvexQuery } from "@convex-dev/react-query";
import { api } from "convex/_generated/api";
import { useNavigate } from "react-router";
import { useAnonymousUserId } from "~/lib/hooks/useAnonymousUserId";
import { type Thread, ThreadsList } from "./threads-list";

interface AnonymousThreadsProps {
  activeThreadId?: string;
}

export function AnonymousThreads({ activeThreadId }: AnonymousThreadsProps) {
  const navigate = useNavigate();
  const [anonymousUserId, setAnonymousUserId] = useAnonymousUserId();

  // Get threads from API
  const threadsResult = useConvexQuery(api.ai.query.getAnonymousThreads, {
    paginationOpts: { numItems: 50, cursor: null },
    anonymousUserId: anonymousUserId || undefined,
  });

  const threads: Thread[] = threadsResult?.page || [];
  const threadsLoading = threadsResult === undefined;

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
      title="Anonymous Chats"
    />
  );
}
