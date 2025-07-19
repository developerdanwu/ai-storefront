import type { ToolCallPart } from "ai";
import type { Id } from "convex/_generated/dataModel";
import { match } from "ts-pattern";
import { useLocalStorage } from "usehooks-ts";
import type { ToolDefinition } from "./ai-store";

export function getActiveAgentId({
  availableAgentIds,
  activeAgentId = null,
}: {
  availableAgentIds: Id<"aiAgentPersona">[];
  activeAgentId: Id<"aiAgentPersona"> | null;
}) {
  return (
    availableAgentIds.find((id) => id === activeAgentId) || availableAgentIds[0]
  );
}

export const ACTIVE_AGENT_ID_STORAGE_KEY = "active-agent-id";

export function useActiveAgentId() {
  return useLocalStorage(
    ACTIVE_AGENT_ID_STORAGE_KEY,
    null as Id<"aiAgentPersona"> | null
  );
}

export async function handleToolCall(
  toolInvocationPart: ToolCallPart,
  clientTool: ToolDefinition
) {
  await match({
    clientTool,
    toolInvocationPart,
  })
    .with(
      {
        clientTool: {
          name: "configure-agent",
        },
      },
      async ({ clientTool }) => {
        await clientTool.callback(toolInvocationPart.args as any);
      }
    )
    .with(
      {
        clientTool: {
          name: "navigate",
        },
      },
      async ({ clientTool }) => {
        await clientTool.callback(toolInvocationPart.args as any);
      }
    )
    .exhaustive();
}
