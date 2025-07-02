import type { MessageDoc } from "@convex-dev/agent";
import { toUIMessages } from "@convex-dev/agent/react";
import type { UsePaginatedQueryResult } from "convex/react";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router";
import { Virtualizer, type VirtualizerHandle } from "virtua";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import { MessageInputField } from "~/components/ui/message-input-field";
import { ScrollArea } from "~/components/ui/scroll-area";
import { cn } from "~/lib/utils";
import { Message } from "~/routes/_shell._auth.chat_.$threadId/_components/message";

const MessageSchema = z.object({
  message: z.string().min(1, {
    message: "Message cannot be empty.",
  }),
});

interface ChatThreadBaseProps {
  messages: UsePaginatedQueryResult<MessageDoc>;
  onMessageSubmit: (message: string) => Promise<void>;
  isSubmitting: boolean;
}

export function ChatThreadBase({
  messages,
  onMessageSubmit,
  isSubmitting,
}: ChatThreadBaseProps) {
  const { threadId } = useParams<{ threadId: string }>();
  const virtualizerRef = useRef<VirtualizerHandle>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const shouldStickToBottom = useRef(true);
  const [isInitialized, setIsInitialized] = useState(false);

  const loadingFirstPage = messages.status === "LoadingFirstPage";

  const uiMessages = useMemo(() => {
    return [
      ...(messages.status === "CanLoadMore" || messages.status === "LoadingMore"
        ? ["load-more" as const]
        : []),
      ...toUIMessages(messages.results).map((x) => {
        const originalMessage = messages.results.find((y) => y._id === x.id);
        return {
          ...x,
          originalMessage,
        };
      }),
    ];
  }, [messages.results]);

  // Initialize scroll position to bottom
  useLayoutEffect(() => {
    if (!virtualizerRef.current || loadingFirstPage || isInitialized) {
      return;
    }

    if (uiMessages.length > 0) {
      // Scroll to bottom on initial load
      virtualizerRef.current.scrollToIndex(uiMessages.length - 1, {
        align: "end",
      });
      setIsInitialized(true);
    }
  }, [uiMessages.length, loadingFirstPage, isInitialized]);

  // Auto-scroll to bottom when new messages arrive/streamed in (if user is at bottom)
  useEffect(() => {
    if (!virtualizerRef.current) {
      return;
    }

    if (!shouldStickToBottom.current) {
      return;
    }

    virtualizerRef.current.scrollToIndex(uiMessages.length - 1, {
      align: "end",
    });
  }, [uiMessages]);

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
        <ScrollArea
          viewportRef={viewportRef}
          className="flex-[1_1_0px] h-0"
          viewportClassName={cn(
            "max-w-7xl w-full relative",
            !isInitialized && "opacity-0"
          )}
        >
          <Virtualizer
            ref={virtualizerRef}
            scrollRef={viewportRef}
            overscan={5}
            onScroll={(offset) => {
              if (!virtualizerRef.current) {
                return;
              }

              // Check if user is near the bottom (within 150px)
              const { scrollSize, viewportSize } = virtualizerRef.current;
              const distanceFromBottom = scrollSize - (offset + viewportSize);
              shouldStickToBottom.current = distanceFromBottom <= 150;
            }}
          >
            {uiMessages.map((message, index) => {
              const nextMessage = uiMessages[index + 1];

              if (message === "load-more") {
                return (
                  <Button
                    variant="ghost"
                    className="w-full"
                    key="load-more"
                    onClick={() => {
                      messages.loadMore(20);
                    }}
                    disabled={messages.status !== "CanLoadMore"}
                  >
                    Load older messages
                  </Button>
                );
              }

              return (
                <div key={message.key} className="mb-4 text-sm">
                  <Message
                    message={message}
                    key={message.key}
                    nextMessage={
                      nextMessage === "load-more" ? undefined : nextMessage
                    }
                  />
                </div>
              );
            })}
          </Virtualizer>
        </ScrollArea>
        <MessageInputField
          name="message"
          placeholder="Type your message..."
          onSubmit={async (value) => {
            // Ensure we stick to bottom when sending a message
            shouldStickToBottom.current = true;
            await onMessageSubmit(value.message);
          }}
          isSubmitting={isSubmitting}
          rows={1}
        />
      </div>
    </div>
  );
}
