import { useThreadMessages } from "@convex-dev/agent/react";
import { useConvexAction } from "@convex-dev/react-query";
import { useMutation } from "@tanstack/react-query";
import { api } from "convex/_generated/api";
import { useCallback } from "react";
import { useParams } from "react-router";
import { ChatThreadBase } from "./chat-thread-base";

export function AnonymousChatThread() {
  const { threadId } = useParams<{ threadId: string }>();

  // Get messages for the current thread using anonymous API
  const messages = useThreadMessages(
    api.ai.query.getAnonymousThreadMessages,
    {
      threadId: threadId!,
    },
    {
      initialNumItems: 20,
      stream: true,
    }
  );

  // Send message using anonymous API
  const continueThreadMutation = useMutation({
    mutationFn: useConvexAction(api.ai.action.continueAnonymousThread),
    onSuccess: () => {
      // The query will automatically refetch due to reactivity
    },
  });

  const isStreaming =
    continueThreadMutation.isPending ||
    messages.results.some((x) => x.streaming);

  // Handle message submission
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
    <ChatThreadBase
      isStreaming={isStreaming}
      messages={messages}
      onMessageSubmit={handleMessageSubmit}
      isSubmitting={continueThreadMutation.isPending}
    />
  );
}
