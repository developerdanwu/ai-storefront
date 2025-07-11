import { type MessageDoc } from "@convex-dev/agent";
import { type UIMessage, useSmoothText } from "@convex-dev/agent/react";
import { convexQuery } from "@convex-dev/react-query";
import {} from "@radix-ui/react-collapsible";
import { useQuery } from "@tanstack/react-query";
import { createAtom } from "@xstate/store";
import { useAtom } from "@xstate/store/react";
import { api } from "convex/_generated/api";
import {
  AlertTriangleIcon,
  ChevronDown,
  ChevronUp,
  LightbulbIcon,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { memo, useEffect, useRef } from "react";
import { match, P } from "ts-pattern";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible";
import { MemoizedMarkdown } from "~/components/ui/markdown";
import { ScrollArea } from "~/components/ui/scroll-area";
import { cn } from "~/lib/utils";
import { StepStartMessage } from "./step-start-message";
import { ToolResultWrapper } from "./tool-result-wrapper";

const reasoningCollapsedAtom = createAtom({} as Record<string, boolean>);

function TextPart({
  part,
  needToStream,
}: {
  part: Extract<UIMessage["parts"][number], { type: "text" }>;
  needToStream?: boolean;
}) {
  const [visibleText, { isStreaming }] = useSmoothText(part.text, {
    charsPerSec: 400,
  });
  const text = isStreaming && needToStream ? visibleText : part.text;

  return <MemoizedMarkdown content={text} id={part.text} />;
}

function ReasoningPart({
  id,
  part,
  isMessageStreaming,
}: {
  id: string;
  part: Extract<UIMessage["parts"][number], { type: "reasoning" }>;
  isMessageStreaming: boolean;
}) {
  const [visibleText, {}] = useSmoothText(part.reasoning, {
    charsPerSec: 400,
  });

  const isOpen = useAtom(reasoningCollapsedAtom, (s) => s[id] || false);
  const text = isMessageStreaming ? visibleText : part.reasoning;
  const viewportRef = useRef<HTMLDivElement>(null);

  const setIsOpen = (isOpen: boolean) => {
    reasoningCollapsedAtom.set((s) => {
      return {
        ...s,
        [id]: isOpen,
      };
    });
  };

  // Auto-scroll to bottom when streaming
  useEffect(() => {
    if (isMessageStreaming && viewportRef.current) {
      viewportRef.current.scrollTop = viewportRef.current.scrollHeight;
    }
  }, [visibleText, isMessageStreaming]);

  // Disable mouse wheel scroll while streaming
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const handleWheel = (e: WheelEvent) => {
      if (isMessageStreaming) {
        e.preventDefault();
      }
    };

    viewport.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      viewport.removeEventListener("wheel", handleWheel);
    };
  }, [isMessageStreaming]);

  return (
    <Collapsible
      // id to force re-render to reset collapse animation
      key={`${id}-${isMessageStreaming ? "streaming" : "finished"}`}
      className="border rounded-md mb-2"
      open={isMessageStreaming ? true : isOpen}
      onOpenChange={isMessageStreaming ? undefined : setIsOpen}
    >
      <CollapsibleTrigger asChild>
        <button
          className="cursor-pointer text-sm italic flex items-center p-2 gap-1 w-full"
          disabled={isMessageStreaming}
        >
          <div className="flex items-center gap-1 w-full">
            <LightbulbIcon size={16} />
            <span>{isMessageStreaming ? "Thinking..." : "Thoughts..."}</span>
          </div>
          {isMessageStreaming ? (
            <ChevronUp className="justify-self-center" size={16} />
          ) : isOpen ? (
            <ChevronUp className="justify-self-center" size={16} />
          ) : (
            <ChevronDown className="justify-self-center" size={16} />
          )}
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent asChild animate>
        <div className="p-3 text-xs leading-relaxed">
          {isMessageStreaming ? (
            <div className="relative">
              <ScrollArea
                viewportRef={viewportRef}
                className="h-40"
                style={{ overflowAnchor: "none" }}
              >
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                >
                  <MemoizedMarkdown content={text} id={part.reasoning} />
                </motion.div>
              </ScrollArea>
              <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-background to-transparent pointer-events-none" />
              <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-background to-transparent pointer-events-none" />
            </div>
          ) : (
            <MemoizedMarkdown content={text} id={part.reasoning} />
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

function UserMessageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex self-end w-max flex-col border rounded-md bg-muted max-w-11/12">
      <div className="p-2">{children}</div>
    </div>
  );
}

function AssistantMessageWrapper({ children }: { children: React.ReactNode }) {
  const { data: agentProfile } = useQuery({
    ...convexQuery(api.ai.query.getAiAgentProfile, {}),
    throwOnError: false,
  });
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <Avatar className="size-7 rounded-lg">
          <AvatarImage src={agentProfile?.url ?? undefined} />
          <AvatarFallback>DW</AvatarFallback>
        </Avatar>
        <p className="text-sm">Dan</p>
      </div>
      {children}
    </div>
  );
}

function _Message({
  message,
  nextMessage,
  isStreaming,
}: {
  isStreaming: boolean;
  message: UIMessage & {
    originalMessage?: MessageDoc;
  };
  nextMessage?: UIMessage & {
    originalMessage?: MessageDoc;
  };
}) {
  console.log("MESSAGE", message);
  const error = match({
    role: message.role,
    error: message.originalMessage?.error,
    nextMessageError: nextMessage?.originalMessage?.error,
  })
    .with(
      {
        role: "user",
        error: P.not(P.nullish),
        nextMessageError: P.nullish,
      },
      ({ error }) => {
        return error;
      }
    )
    .with(
      {
        role: "assistant",
        error: "MaxStepsReached",
      },
      () => {
        return "Max number of AI steps reached for this message. Please send another message to continue the conversation.";
      }
    )
    .otherwise(() => {
      return null;
    });
  const MessageWrapper =
    message.role === "user" ? UserMessageWrapper : AssistantMessageWrapper;

  return (
    <div className="flex flex-col gap-2">
      <MessageWrapper>
        {message.parts.map((x, index) => {
          return match(x)
            .with(
              {
                type: "text",
              },
              (x) => {
                if (message.role === "user") {
                  return (
                    <p key={`${message.key}-${index}`} className="text-sm">
                      {x.text}
                    </p>
                  );
                }
                return (
                  <TextPart
                    key={`${message.key}-${index}`}
                    part={x}
                    needToStream={isStreaming}
                  />
                );
              }
            )
            .with(
              {
                type: "step-start",
              },
              (x) => {
                const nextStep = message.parts[index + 1];
                return (
                  <StepStartMessage
                    key={`${message.key}-${index}`}
                    part={x}
                    message={message}
                    nextStep={nextStep}
                  />
                );
              }
            )
            .with(
              {
                type: "tool-invocation",
                toolInvocation: {
                  state: "result",
                  result: {
                    success: true,
                  },
                },
              },
              ({ toolInvocation }) => {
                return (
                  <ToolResultWrapper
                    key={`${message.key}-${index}`}
                    toolName={toolInvocation.toolName}
                    success={toolInvocation.result.success}
                  >
                    <ScrollArea>
                      <div
                        className={cn(
                          "p-3 bg-muted/80 whitespace-pre rounded text-xs font-mono",
                          !toolInvocation.result.success && "text-red-600"
                        )}
                      >
                        {JSON.stringify(toolInvocation.result, null, 2)}
                      </div>
                    </ScrollArea>
                  </ToolResultWrapper>
                );
              }
            )
            .with(
              {
                type: "tool-invocation",
                toolInvocation: {
                  state: "result",
                  result: {
                    success: false,
                  },
                },
              },
              ({ toolInvocation }) => {
                return (
                  <ToolResultWrapper
                    key={`${message.key}-${index}`}
                    toolName={toolInvocation.toolName}
                    success={toolInvocation.result.success}
                  >
                    <ScrollArea>
                      <div
                        className={cn(
                          "p-3 bg-muted/80 whitespace-pre rounded text-xs font-mono",
                          !toolInvocation.result.success && "text-red-600"
                        )}
                      >
                        {JSON.stringify(toolInvocation.result, null, 2)}
                      </div>
                    </ScrollArea>
                  </ToolResultWrapper>
                );
              }
            )
            .with(
              {
                type: "reasoning",
              },
              (x) => {
                return (
                  <AnimatePresence mode="wait">
                    <ReasoningPart
                      isMessageStreaming={message.status === "streaming"}
                      key={`${message.key}-${index}`}
                      id={`${message.key}-${index}`}
                      part={x}
                    />
                  </AnimatePresence>
                );
              }
            )
            .otherwise(() => null);
        })}
      </MessageWrapper>
      {error ? (
        <div className="text-destructive-emphasis flex">
          <AlertTriangleIcon className="size-4 mr-2 shrink-0 inline-block align-middle" />
          <span className="-mt-0.5 inline-block align-middle">{error}</span>
        </div>
      ) : null}
    </div>
  );
}

export const Message = memo(_Message);
