import { type MessageDoc } from "@convex-dev/agent";
import { type UIMessage, useSmoothText } from "@convex-dev/agent/react";
import { convexQuery } from "@convex-dev/react-query";
import { useQuery } from "@tanstack/react-query";
import { api } from "convex/_generated/api";
import { AlertTriangleIcon } from "lucide-react";
import { match, P } from "ts-pattern";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { MemoizedMarkdown } from "~/components/ui/markdown";
import { ScrollArea } from "~/components/ui/scroll-area";
import { cn } from "~/lib/utils";
import { StepStartMessage } from "./step-start-message";
import { ToolResultWrapper } from "./tool-result-wrapper";

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

function UserMessageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex self-end w-max flex-col border rounded-md bg-muted">
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

export function Message({
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
              (x) => (
                <TextPart key={index} part={x} needToStream={isStreaming} />
              )
            )
            .with(
              {
                type: "step-start",
              },
              (x) => {
                const nextStep = message.parts[index + 1];
                return (
                  <StepStartMessage
                    key={index}
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
            .otherwise(() => null);

          if (x.type === "step-start") {
            const nextStep = message.parts[index + 1];
            return (
              <StepStartMessage
                key={index}
                part={x}
                message={message}
                nextStep={nextStep}
              />
            );
          }

          if (x.type === "tool-invocation") {
            return (
              <ToolResultWrapper
                success={true}
                jsonResponse={x.jsonResponse}
              ></ToolResultWrapper>
            );
          }

          return <div key={index}>unknown part</div>;
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
