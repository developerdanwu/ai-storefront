import { useThreadMessages } from "@convex-dev/agent/react";
import { useConvexMutation } from "@convex-dev/react-query";
import { useMutation } from "@tanstack/react-query";
import { api } from "convex/_generated/api";
import { useEffect, useMemo, useRef } from "react";
import { Virtualizer, type VirtualizerHandle } from "virtua";
import { AiConversationEditor } from "~/components/secondary-panel/ai/conversation-editor";
import { handleToolCall } from "~/components/secondary-panel/ai/utils";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { Message } from "~/routes/_providers._shell.chat.$threadId/_components/message";
import { useAiStore } from "./ai-store";
import { toUIMessages } from "./to-ui-messages";
export function AiThread({ threadId }: { threadId: string }) {
  const virtualizerRef = useRef<VirtualizerHandle>(null);
  const shouldStickToBottom = useRef(true);
  const aiStore = useAiStore();
  const completeToolCall = useMutation({
    mutationFn: useConvexMutation(
      api.product.ai.mutation.completeKaolinToolCall
    ),
    onSettled: () => {
      aiStore.send({
        type: "toolCallCompleted",
      });
    },
  });
  const messages = useThreadMessages(
    api.product.ai.query.getKaolinThreadMessages,
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
      ...toUIMessages(messages.results, {
        onToolCall: ({ toolInvocationPart, messageId }) => {
          aiStore.send({
            type: "toolCalled",
            toolInvocationPart,
            messageId,
          });
        },
      }).map((x) => {
        const originalMessage = messages.results.find((y) => y._id === x.id);
        return {
          ...x,
          originalMessage,
        };
      }),
    ];
  }, [messages.results, aiStore]);

  console.log("UI messages", uiMessages);
  useEffect(() => {
    const toolCallSub = aiStore.on(
      "onToolCall",
      async ({ toolInvocationPart, messageId, clientTool }) => {
        if (clientTool) {
          await handleToolCall(toolInvocationPart, clientTool);
          completeToolCall.mutate({
            threadId,
            messageId,
            toolCallId: toolInvocationPart.toolCallId,
            toolName: toolInvocationPart.toolName,
            result: { kind: "success" },
          });
        }
      }
    );

    return () => {
      toolCallSub.unsubscribe();
    };
  }, [aiStore, completeToolCall, threadId]);

  return (
    <>
      <div className="p-4 flex-[1_1_0px] overflow-y-auto h-0 w-full overscroll-none">
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
