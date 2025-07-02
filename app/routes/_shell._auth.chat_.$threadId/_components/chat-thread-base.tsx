import { toUIMessages } from "@convex-dev/agent/react";
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router";
import { VList, type VListHandle } from "virtua";
import { z } from "zod";
import { MessageInputField } from "~/components/ui/message-input-field";
import { VirtuaScrollWrapper } from "~/components/ui/virtua-scroll-wrapper";
import { cn } from "~/lib/utils";
import { MessageWrapper } from "./message-wrapper";

const MessageSchema = z.object({
  message: z.string().min(1, {
    message: "Message cannot be empty.",
  }),
});

interface ChatThreadBaseProps {
  messages: {
    status: "LoadingFirstPage" | "CanLoadMore" | "LoadingMore" | "Exhausted";
    results: any[];
  };
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
              if (message === "load-more") {
                return <div key={`load-more-${index}`}>Load more</div>;
              }

              return (
                <MessageWrapper
                  key={message.id}
                  direction={message.role === "user" ? "outgoing" : "incoming"}
                >
                  <div className="text-sm whitespace-pre-wrap">
                    {typeof message.content === "string"
                      ? message.content
                      : Array.isArray(message.content)
                      ? (message.content as any[])
                          .filter((item: any) => item.type === "text")
                          .map((item: any) => item.text)
                          .join("")
                      : "Message content unavailable"}
                  </div>
                  <p className="text-xs opacity-70 mt-2">
                    {new Date(message.createdAt!).toLocaleTimeString()}
                  </p>
                </MessageWrapper>
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
