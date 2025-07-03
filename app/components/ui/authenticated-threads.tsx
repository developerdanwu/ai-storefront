import { usePaginatedQuery } from "convex-helpers/react";
import { api } from "convex/_generated/api";
import { useState } from "react";
import { useNavigate } from "react-router";
import { ThreadsList } from "./threads-list";

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

  // const searchThreadsResult = usePaginatedQuery(
  //   api.ai.query.searchThreads,
  //   {
  //     query: "124",
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
      threads={threads}
      isLoading={threadsLoading}
      activeThreadId={activeThreadId}
      onThreadSelect={handleThreadSelect}
      query={query}
      onQueryChange={setQuery}
    />
  );
}
