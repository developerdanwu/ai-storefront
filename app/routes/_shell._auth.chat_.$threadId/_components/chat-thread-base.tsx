import type { MessageDoc } from "@convex-dev/agent";
import { toUIMessages } from "@convex-dev/agent/react";
import type { UsePaginatedQueryResult } from "convex/react";
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router";
import { VList, type VListHandle } from "virtua";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import { MessageInputField } from "~/components/ui/message-input-field";
import { VirtuaScrollWrapper } from "~/components/ui/virtua-scroll-wrapper";
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
  const ref = useRef<VListHandle>(null);
  const shouldStickToBottom = useRef(false);
  const [isInitialised, setIsInitialised] = useState(false);

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

  const messagesCount = useRef(uiMessages.length);
  messagesCount.current = uiMessages.length;

  useLayoutEffect(() => {
    if (!ref.current || loadingFirstPage || isInitialised) {
      return;
    }
    const handle = ref.current;
    // initial scroll to bottom
    const interval = setInterval(() => {
      ref.current?.scrollToIndex(messagesCount.current - 1);

      if (
        handle.findEndIndex() === messagesCount.current - 1 &&
        handle.scrollSize - (handle.scrollOffset + handle.viewportSize) < 1
      ) {
        setIsInitialised(true);
        clearInterval(interval);
      }
    }, 100);

    return () => {
      clearInterval(interval);
    };
  }, [isInitialised, loadingFirstPage]);

  // Handle message submission
  const handleMessageSubmit = useCallback(
    async (message: string) => {
      console.log("Sending message", message);
      await onMessageSubmit(message);
    },
    [onMessageSubmit]
  );

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
      <div className="h-full max-w-7xl w-full flex flex-col">
        <VirtuaScrollWrapper>
          <VList
            ref={ref}
            overscan={20}
            style={{
              height: "100%",
              width: "100%",
            }}
            count={uiMessages.length}
            className={cn(
              "pointer-events-none opacity-0 my-2 flex-[1_1_0px] h-0 w-full relative",
              isInitialised && "pointer-events-auto opacity-100"
            )}
            onScroll={(offset) => {
              if (!ref.current) {
                return;
              }

              const shouldStickToBottomValue =
                offset - ref.current.scrollSize + ref.current.viewportSize >=
                // eslint-disable-next-line no-warning-comments
                // FIXME: The sum may not be 0 because of sub-pixel value when browser's window.devicePixelRatio has decimal value
                -150;
              shouldStickToBottom.current = shouldStickToBottomValue;
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
          </VList>
        </VirtuaScrollWrapper>
        <MessageInputField
          name="message"
          placeholder="Type your message..."
          onSubmit={handleMessageSubmit}
          schema={MessageSchema.shape.message}
          isSubmitting={isSubmitting}
          rows={1}
        />
      </div>
    </div>
  );
}
