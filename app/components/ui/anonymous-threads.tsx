import { api } from "convex/_generated/api";
import { usePaginatedQuery } from "convex/react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { useAnonymousUserId } from "~/lib/hooks/useAnonymousUserId";
import { ThreadsList } from "./threads-list";

interface AnonymousThreadsProps {
  activeThreadId?: string;
}

export function AnonymousThreads({ activeThreadId }: AnonymousThreadsProps) {
  const navigate = useNavigate();
  const [anonymousUserId] = useAnonymousUserId();
  const [query, setQuery] = useState("");
  // Get threads from API
  const threadsResult = usePaginatedQuery(
    api.ai.query.getAnonymousThreads,
    {
      anonymousUserId: anonymousUserId || undefined,
    },
    {
      initialNumItems: 20,
    }
  );

  // const searchThreadsResult = usePaginatedQuery(
  //   api.ai.query.searchAnonymousThreads,
  //   {
  //     anonymousUserId: anonymousUserId || undefined,
  //     query: query,
  //   },
  //   {
  //     initialNumItems: 20,
  //   }
  // );
  const threads = threadsResult.results || [];
  const threadsLoading = threadsResult === undefined;

  const handleThreadSelect = (selectedThreadId: string) => {
    navigate(`/chat/${selectedThreadId}`);
  };

  return (
    <ThreadsList
      query={query}
      onQueryChange={setQuery}
      threads={threads}
      isLoading={threadsLoading}
      activeThreadId={activeThreadId}
      onThreadSelect={handleThreadSelect}
    />
  );
}
