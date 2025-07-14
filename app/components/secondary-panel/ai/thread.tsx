import { toUIMessages, useThreadMessages } from "@convex-dev/agent/react";
import { api } from "convex/_generated/api";
import { useMemo, useRef } from "react";
import { Virtualizer, type VirtualizerHandle } from "virtua";
import { AiConversationEditor } from "~/components/secondary-panel/ai/conversation-editor";
import { Button } from "~/components/ui/button";
import { Message } from "~/routes/_providers._shell.chat.$threadId/_components/message";

export function AiThread({ threadId }: { threadId: string }) {
  const virtualizerRef = useRef<VirtualizerHandle>(null);
  const shouldStickToBottom = useRef(true);

  const messages = useThreadMessages(
    api.ai.query.getThreadMessages,
    {
      threadId,
    },
    {
      initialNumItems: 10,
      stream: true,
    }
  );
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
  return (
    <>
      <div className="flex-[1_1_0px] overflow-y-auto h-0 w-full overscroll-none">
        <Virtualizer
          shift={false}
          ref={virtualizerRef}
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
                  index === uiMessages.length - 1 && "min-h-[calc(100vh-25rem)]"
                )}
              >
                <Message
                  isStreaming={false}
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
      <AiConversationEditor />
    </>
  );
}
