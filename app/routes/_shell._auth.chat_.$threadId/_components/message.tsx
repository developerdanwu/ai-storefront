import { type MessageDoc } from "@convex-dev/agent";
import { type UIMessage, useSmoothText } from "@convex-dev/agent/react";
import { AlertTriangleIcon } from "lucide-react";
import { match, P } from "ts-pattern";
import { MemoizedMarkdown } from "~/components/ui/markdown";
import { StepStartMessage } from "./step-start-message";

function TextPart({
  part,
}: {
  part: Extract<UIMessage["parts"][number], { type: "text" }>;
}) {
  const [visibleText, { isStreaming }] = useSmoothText(part.text);
  const text = isStreaming ? visibleText : part.text;

  return <MemoizedMarkdown content={text} id={part.text} />;
}

function UserMessageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col border rounded-md">
      <div className="p-2">{children}</div>
    </div>
  );
}

function AssistantMessageWrapper({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col gap-2">{children}</div>;
}

export function Message({
  message,
  nextMessage,
}: {
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
          if (x.type === "text") {
            return <TextPart key={index} part={x} />;
          }

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
            return null;
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
