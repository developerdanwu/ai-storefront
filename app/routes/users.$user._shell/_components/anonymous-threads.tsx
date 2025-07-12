import { convexQuery } from "@convex-dev/react-query";
import { useQuery } from "@tanstack/react-query";
import { api } from "convex/_generated/api";
import { usePaginatedQuery } from "convex/react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { useAnonymousUserId } from "~/lib/hooks/useAnonymousUserId";
import { ThreadsList } from "../../../components/threads-list";

interface AnonymousThreadsProps {
  activeThreadId?: string;
}

export function AnonymousThreads({ activeThreadId }: AnonymousThreadsProps) {
  const navigate = useNavigate();
  const [anonymousUserId] = useAnonymousUserId();
  const [query, setQuery] = useState("");
  // Get threads from API
  const { results: threadsResult, status: threadsStatus } = usePaginatedQuery(
    api.ai.query.getAnonymousThreads,
    {
      anonymousUserId: anonymousUserId || undefined,
    },
    {
      initialNumItems: 20,
    }
  );

  const { data: searchThreadsResult } = useQuery(
    convexQuery(api.ai.query.searchAnonymousThreads, {
      query: query,
      limit: 20,
      anonymousUserId: anonymousUserId,
    })
  );

  const threads = query ? searchThreadsResult || [] : threadsResult || [];
  const threadsLoading = threadsStatus === "LoadingFirstPage";

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
