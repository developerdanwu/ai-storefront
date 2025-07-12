import { convexQuery } from "@convex-dev/react-query";
import { useQuery } from "@tanstack/react-query";
import { usePaginatedQuery } from "convex-helpers/react";
import { api } from "convex/_generated/api";
import { useState } from "react";
import { useNavigate } from "react-router";
import { ThreadsList } from "../../../components/threads-list";

interface AuthenticatedThreadsProps {
  activeThreadId?: string;
}

export function AuthenticatedThreads({
  activeThreadId,
}: AuthenticatedThreadsProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  // Get threads from API
  const threadsResult = usePaginatedQuery(
    api.ai.query.getThreads,
    {},
    {
      initialNumItems: 20,
    }
  );

  const searchThreadsResult = useQuery(
    convexQuery(api.ai.query.searchThreads, {
      query: query,
      limit: 20,
    })
  );

  const threads = query
    ? searchThreadsResult.data || []
    : threadsResult.results || [];
  const threadsLoading =
    threadsResult.isLoading || searchThreadsResult.isLoading;

  const handleThreadSelect = (selectedThreadId: string) => {
    navigate(`/chat/${selectedThreadId}`);
  };

  return (
    <ThreadsList
      threads={threads}
      isLoading={threadsLoading}
      activeThreadId={activeThreadId}
      onThreadSelect={handleThreadSelect}
      query={query}
      onQueryChange={setQuery}
    />
  );
}
