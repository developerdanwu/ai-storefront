import { type UIMessage } from "@convex-dev/agent/react";
import { SearchIcon } from "lucide-react";
import { match, P } from "ts-pattern";
import { LoadingSpinner } from "~/components/ui/loading-spinner";

export function StepStartMessage({
  part,
  message,
  nextStep,
}: {
  part: Extract<UIMessage["parts"][number], { type: "step-start" }>;
  message: UIMessage;
  nextStep: UIMessage["parts"][number] | undefined;
}) {
  const nextToolInvocation = match(nextStep)
    .with(P.not(P.nullish), (nextStep) => {
      if (nextStep.type === "tool-invocation") {
        return nextStep;
      }
      return null;
    })
    .otherwise(() => null);

  if (!nextToolInvocation) {
    return (
      <div className="flex items-center gap-2">
        <LoadingSpinner className="size-4" />
        <div className="text-background-emphasis/80">starting step</div>
      </div>
    );
  }

  return match({ nextToolInvocation, status: message.status })
    .with(
      {
        nextToolInvocation: {
          toolInvocation: {
            state: "result",
            toolName: "searchContacts",
          },
        },
      },
      () => (
        <div className="flex items-center gap-1">
          <SearchIcon className="size-4" />
          <p className="text-background-emphasis/80">
            {`Searched contacts with query "${nextToolInvocation.toolInvocation.args.searchQuery}"`}
          </p>
        </div>
      )
    )
    .with(
      {
        nextToolInvocation: {
          toolInvocation: {
            state: "result",
            toolName: "createContact",
          },
        },
      },
      () => (
        <div className="flex items-center gap-2">
          <SearchIcon className="size-4" />
          <div className="text-background-emphasis/80">Created contact</div>
        </div>
      )
    )
    .with(
      {
        nextToolInvocation: {
          toolInvocation: {
            state: "call",
            toolName: "createContact",
          },
        },
        status: "pending",
      },
      () => (
        <div className="flex items-center gap-2">
          <LoadingSpinner className="size-4" />
          <div className="text-background-emphasis/80">Creating contact</div>
        </div>
      )
    )
    .with(
      {
        nextToolInvocation: {
          toolInvocation: {
            state: "call",
          },
        },
        status: "pending",
      },
      () => {
        return (
          <div className="flex items-center gap-2">
            <LoadingSpinner className="size-4" />
            <div className="text-background-emphasis/80">Starting step</div>
          </div>
        );
      }
    )
    .otherwise(() => null);
}
