import { useThreadMessages } from "@convex-dev/agent/react";
import { useConvexAction } from "@convex-dev/react-query";
import { useMutation } from "@tanstack/react-query";
import { api } from "convex/_generated/api";
import type { BackendErrors } from "convex/errors";
import { ConvexError } from "convex/values";
import { useCallback } from "react";
import { useParams } from "react-router";
import { toast } from "sonner";
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
    onError: (error) => {
      if (error instanceof ConvexError) {
        const data = error.data as BackendErrors;
        if (data._tag === "RateLimitExceeded") {
          return toast.error(
            `Rate limit exceeded, please try again in ${Math.ceil(
              data.context.retryAfter / 1000
            )} seconds`
          );
        }
      }
      return toast.error("Failed to continue thread");
    },
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
