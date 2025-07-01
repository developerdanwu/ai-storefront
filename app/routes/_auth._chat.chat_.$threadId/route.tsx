import { toUIMessages, useThreadMessages } from "@convex-dev/agent/react";
import { useConvexAction, useConvexQuery } from "@convex-dev/react-query";
import { useMutation } from "@tanstack/react-query";
import { api } from "convex/_generated/api";
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router";
import { VList, type VListHandle } from "virtua";
import { z } from "zod";
import { MessageInputField } from "~/components/ui/message-input-field";
import { VirtuaScrollWrapper } from "~/components/ui/virtua-scroll-wrapper";
import { cn } from "~/lib/utils";
import { MessageWrapper } from "./_components/message-wrapper";

const MessageSchema = z.object({
  message: z.string().min(1, {
    message: "Message cannot be empty.",
  }),
});

export default function ChatThreadRoute() {
  const { threadId } = useParams();
  const ref = useRef<VListHandle>(null);
  const shouldStickToBottom = useRef(false);
  const [isInitialised, setIsInitialised] = useState(false);
  // Get messages for the current thread
  const messages = useThreadMessages(
    api.ai.getMessages,
    {
      threadId: threadId!,
    },
    {
      initialNumItems: 20,
      stream: true,
    }
  );

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

  // Get threads to find the current thread's title
  const threadsResult = useConvexQuery(api.ai.getThreads, {
    paginationOpts: { numItems: 50, cursor: null },
  });

  const threads = threadsResult?.page || [];
  const currentThread = threads.find((t) => t._id === threadId);

  // Send message
  const sendMessage = useMutation({
    mutationFn: useConvexAction(api.ai.sendMessage),
    onSuccess: () => {
      // The query will automatically refetch due to reactivity
    },
  });

  // Handle message submission
  const handleMessageSubmit = useCallback(
    async (message: string) => {
      if (threadId) {
        console.log("Sending message", message);
        sendMessage.mutate({
          threadId: threadId as any, // Type assertion for now
          prompt: message,
        });
      }
    },
    [threadId, sendMessage]
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
    <div className="h-full flex flex-col">
      {/* Chat Header */}
      <div className="p-4 border-b border-border">
        <h2 className="font-semibold">{currentThread?.title || "Chat"}</h2>
      </div>
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
          {uiMessages.map((message) => {
            if (message === "load-more") {
              return <div>Load more</div>;
            }

            return (
              <MessageWrapper
                direction={message.role === "user" ? "outgoing" : "incoming"}
              >
                <div className="text-sm whitespace-pre-wrap">
                  {typeof message.content === "string"
                    ? message.content
                    : Array.isArray(message.content)
                    ? message.content
                        .filter((item) => item.type === "text")
                        .map((item) => item.text)
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
      <div className="p-4 border-t border-border">
        <MessageInputField
          name="message"
          placeholder="Type your message..."
          onSubmit={handleMessageSubmit}
          schema={MessageSchema.shape.message}
          isSubmitting={sendMessage.isPending}
          rows={1}
        />
      </div>
    </div>
  );
}
