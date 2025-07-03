import { useThreadMessages } from "@convex-dev/agent/react";
import { useConvexAction } from "@convex-dev/react-query";
import { useMutation } from "@tanstack/react-query";
import { usePaginatedQuery } from "convex-helpers/react";
import { api } from "convex/_generated/api";
import { useCallback } from "react";
import { useParams } from "react-router";
import { ChatThreadBase } from "./chat-thread-base";

export function AuthenticatedChatThread() {
  const { threadId } = useParams<{ threadId: string }>();

  const messages = useThreadMessages(
    api.ai.query.getThreadMessages,
    {
      threadId: threadId!,
    },
    {
      initialNumItems: 10,
      stream: true,
    }
  );

  const messages2 = usePaginatedQuery(
    api.ai.query.getThreadMessages,
    {
      threadId: threadId!,
    },
    {
      initialNumItems: 10,
    }
  );

  console.log("MESSAGES2", messages2.status);

  const continueThreadMutation = useMutation({
    mutationFn: useConvexAction(api.ai.action.continueThread),
    onSuccess: () => {},
  });

  const isStreaming =
    continueThreadMutation.isPending ||
    messages.results.some((x) => x.streaming);

  const handleMessageSubmit = useCallback(
    async (message: string) => {
      await continueThreadMutation.mutateAsync({
        threadId: threadId!,
        prompt: message,
      });
    },
    [threadId, continueThreadMutation]
  );

  return (
    <>
      <button
        onClick={() => {
          messages2.loadMore(10);
        }}
      >
        Load more paginated
      </button>
      <ChatThreadBase
        isStreaming={isStreaming}
        messages={messages}
        onMessageSubmit={handleMessageSubmit}
        isSubmitting={continueThreadMutation.isPending}
      />
    </>
  );
}
