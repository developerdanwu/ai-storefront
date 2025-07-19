import type { UIMessage } from "ai";
import { ScrollArea } from "~/components/ui/scroll-area";
import { cn } from "~/lib/utils";
import { ToolResultWrapper } from "~/routes/_providers._shell.chat.$threadId/_components/tool-result-wrapper";

export function ConfigureAgentTool({
  part,
}: {
  part: Extract<UIMessage["parts"][number], { type: "tool-invocation" }>;
}) {
  const { toolInvocation } = part;

  return (
    <ToolResultWrapper toolName={toolInvocation.toolName} success="pending">
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
