import { useThreadMessages } from "@convex-dev/agent/react";
import { useConvexAction } from "@convex-dev/react-query";
import { useMutation } from "@tanstack/react-query";
import { api } from "convex/_generated/api";
import { useCallback } from "react";
import { useParams } from "react-router";
import { ChatThreadBase } from "./chat-thread-base";

export function AuthenticatedChatThread() {
  const { threadId } = useParams<{ threadId: string }>();

  // Get messages for the current thread
  const messages = useThreadMessages(
    api.ai.query.getThreadMessages,
    {
      threadId: threadId!,
    },
    {
      initialNumItems: 20,
      stream: true,
    }
  );

  // Send message
  const continueThreadMutation = useMutation({
    mutationFn: useConvexAction(api.ai.action.continueThread),
    onSuccess: () => {
      // The query will automatically refetch due to reactivity
    },
  });

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
      messages={messages}
      onMessageSubmit={handleMessageSubmit}
      isSubmitting={continueThreadMutation.isPending}
    />
  );
}
