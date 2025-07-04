import { useThreadMessages } from "@convex-dev/agent/react";
import { useConvexAction } from "@convex-dev/react-query";
import { useMutation } from "@tanstack/react-query";
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

  const continueThreadMutation = useMutation({
    mutationFn: useConvexAction(api.ai.action.continueThread),
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
    <ChatThreadBase
      isStreaming={isStreaming}
      messages={messages}
      onMessageSubmit={handleMessageSubmit}
      isSubmitting={continueThreadMutation.isPending}
    />
  );
}
