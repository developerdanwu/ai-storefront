import type { MessageDoc } from "@convex-dev/agent";
import type { UsePaginatedQueryResult } from "convex/react";
import { useRef } from "react";
import { useParams } from "react-router";
import { ThreadMessages } from "~/components/thread-messages";
import { MessageInputField } from "~/components/ui/message-input-field";

interface ChatThreadBaseProps {
  messages: UsePaginatedQueryResult<MessageDoc>;
  onMessageSubmit: (message: string) => Promise<void>;
  isSubmitting: boolean;
  isStreaming: boolean;
}

export function ChatThreadBase({
  isStreaming,
  messages,
  onMessageSubmit,
  isSubmitting,
}: ChatThreadBaseProps) {
  const { threadId } = useParams<{ threadId: string }>();
  const shouldStickToBottom = useRef(true);

  if (!threadId) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <p>Thread not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col items-center w-full justify-center">
      <div className="h-full w-full flex flex-col">
        <ThreadMessages
          messages={messages}
          isStreaming={isStreaming}
          shouldStickToBottomRef={shouldStickToBottom}
        />
        <MessageInputField
          name="message"
          isGenerating={isStreaming}
          placeholder="Type your message..."
          onContactMe={async () => {
            shouldStickToBottom.current = true;
            await onMessageSubmit(
              "I'd like to contact you. How should I do that?"
            );
          }}
          onSubmit={async (value) => {
            // Ensure we stick to bottom when sending a message
            shouldStickToBottom.current = true;
            await onMessageSubmit(value.message);
          }}
          className="w-full max-w-3xl mx-auto sticky bottom-0"
          isSubmitting={isSubmitting}
          rows={1}
        />
      </div>
    </div>
  );
}
