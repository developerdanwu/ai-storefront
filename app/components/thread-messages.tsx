import { toUIMessages } from "@convex-dev/agent/react";
import type { UsePaginatedQueryResult } from "convex/react";
import type { MessageDoc } from "node_modules/@convex-dev/agent/src/component/schema";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Virtualizer, type VirtualizerHandle } from "virtua";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { ChatThreadSkeleton } from "~/routes/_shell.chat.$threadId/_components/chat-thread-skeleton";
import { Message } from "~/routes/_shell.chat.$threadId/_components/message";

export function ThreadMessages({
  messages,
  isStreaming,
  shouldStickToBottomRef,
  className,
  ...rest
}: {
  messages: UsePaginatedQueryResult<MessageDoc>;
  isStreaming: boolean;
  shouldStickToBottomRef: React.MutableRefObject<boolean>;
} & React.HTMLAttributes<HTMLDivElement>) {
  const virtualizerRef = useRef<VirtualizerHandle>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoadingOlderMessages, setIsLoadingOlderMessages] = useState(false);

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

  // Track when we're loading older messages to maintain scroll position
  useEffect(() => {
    if (messages.status === "LoadingMore") {
      setIsLoadingOlderMessages(true);
    } else if (
      messages.status === "CanLoadMore" ||
      messages.status === "Exhausted"
    ) {
      // Keep shift=true for one more render cycle after loading completes
      const timer = setTimeout(() => {
        setIsLoadingOlderMessages(false);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [messages.status]);

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

    if (!shouldStickToBottomRef.current) {
      return;
    }

    virtualizerRef.current.scrollToIndex(uiMessages.length - 1, {
      align: "end",
    });
  }, [uiMessages]);

  return (
    <>
      {messages.status === "LoadingFirstPage" && <ChatThreadSkeleton />}
      {messages.status !== "LoadingFirstPage" && (
        <div
          className={cn(
            "flex-[1_1_0px] overflow-y-auto h-0 w-full overscroll-none",
            className
          )}
          {...rest}
        >
          <Virtualizer
            shift={isLoadingOlderMessages}
            ref={virtualizerRef}
            overscan={5}
            onScroll={(offset) => {
              if (!virtualizerRef.current) {
                return;
              }

              // Check if user is near the bottom (within 150px)
              const { scrollSize, viewportSize } = virtualizerRef.current;
              const distanceFromBottom = scrollSize - (offset + viewportSize);
              shouldStickToBottomRef.current = distanceFromBottom <= 150;
            }}
          >
            {uiMessages.map((message, index) => {
              const nextMessage = uiMessages[index + 1];

              if (message === "load-more") {
                return (
                  <Button
                    variant="ghost"
                    className="mx-auto flex max-w-3xl mb-4 w-full"
                    key="load-more"
                    onClick={() => {
                      messages.loadMore(20);
                    }}
                    disabled={messages.status === "LoadingMore"}
                  >
                    Load older messages
                  </Button>
                );
              }

              return (
                <div
                  key={message.key}
                  className={cn(
                    "mb-4 max-w-3xl mx-auto text-sm",
                    index === uiMessages.length - 1 &&
                      "min-h-[calc(100vh-25rem)]"
                  )}
                >
                  <Message
                    isStreaming={isStreaming}
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
        </div>
      )}
    </>
  );
}
