import type { Id } from "convex/_generated/dataModel";
import { useLocalStorage } from "usehooks-ts";

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
