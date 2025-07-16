import { useConvexMutation } from "@convex-dev/react-query";
import { useMutation } from "@tanstack/react-query";
import { useSelector } from "@xstate/store/react";
import type { UIMessage } from "ai";
import { api } from "convex/_generated/api";
import { useAiStore } from "~/components/secondary-panel/ai/ai-store";
import { Button } from "~/components/ui/button";
import { ScrollArea } from "~/components/ui/scroll-area";
import { cn } from "~/lib/utils";
import { ToolResultWrapper } from "~/routes/_providers._shell.chat.$threadId/_components/tool-result-wrapper";

export function ConfigureAgentTool({
  part,
  threadId,
  messageId,
}: {
  threadId: string;
  messageId: string;
  part: Extract<UIMessage["parts"][number], { type: "tool-invocation" }>;
}) {
  const { toolInvocation } = part;
  const aiStore = useAiStore();
  const completeToolCall = useMutation({
    mutationFn: useConvexMutation(
      api.product.ai.mutation.completeKaolinToolCall
    ),
  });
  const configureAgentTool = useSelector(
    aiStore,
    (s) => s.context.toolMap["configure-agent"]
  );

  return (
    <ToolResultWrapper toolName={toolInvocation.toolName} success="pending">
      <Button
        onClick={() => {
          configureAgentTool.callback({
            customPrompt: part.toolInvocation.args.customPrompt,
          });
          completeToolCall.mutate({
            threadId,
            messageId,
            result: {
              kind: "success",
            },
          });
        }}
      >
        testing
      </Button>
      <ScrollArea>
        <div
          className={cn(
            "p-3 bg-muted/80 whitespace-pre rounded text-xs font-mono"
          )}
        >
          {JSON.stringify(toolInvocation, null, 2)}
        </div>
      </ScrollArea>
    </ToolResultWrapper>
  );
}
