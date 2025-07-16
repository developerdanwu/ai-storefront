import { convexQuery } from "@convex-dev/react-query";
import { useQuery } from "@tanstack/react-query";
import { createStore } from "@xstate/store";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { createContext, useContext, useEffect, useRef } from "react";
import {
  ACTIVE_AGENT_ID_STORAGE_KEY,
  useActiveAgentId,
} from "~/components/secondary-panel/ai/utils";
import { PageLoadingSpinner } from "~/components/ui/page-loading-spinner";
import { getActiveAgentId } from "./utils";

export type ToolDefinition = {
  name: "configure-agent";
  displayName: string;
  description: `Kaolin AI can ${string}`;
  icon?: React.ReactNode;
  context: Record<string, any>;
  callback: (toolOutput: any) => void | Promise<void>;
};

const createAiStore = ({
  initialActiveAgentId,
}: {
  initialActiveAgentId: Id<"aiAgentPersona"> | null;
}) =>
  createStore({
    context: {
      toolMap: {} as Record<string, ToolDefinition>,
      activeAgentId: initialActiveAgentId,
      playgroundThreadId: null as string | null,
      kaolinThreadId: null as string | null,
    },
    emits: {
      activeAgentChanged: (payload: { agentId: Id<"aiAgentPersona"> }) => {},
    },
    on: {
      setActiveAgent: (
        context,
        { agentId }: { agentId: Id<"aiAgentPersona"> },
        { emit }
      ) => {
        emit.activeAgentChanged({ agentId });
        return {
          ...context,
          activeAgentId: agentId,
        };
      },
      registerTool: (context, { tool }: { tool: ToolDefinition }) => {
        return {
          ...context,
          toolMap: {
            ...context.toolMap,
            [tool.name]: tool,
          },
        };
      },
      unregisterTool: (context, { key }: { key: string }) => {
        const newState = { ...context.toolMap };
        delete newState[key];

        return {
          ...context,
          toolMap: newState,
        };
      },
      setPlaygroundThreadId: (
        context,
        { playgroundThreadId }: { playgroundThreadId: string | null }
      ) => {
        return {
          ...context,
          playgroundThreadId,
        };
      },
      setKaolinThreadId: (
        context,
        { kaolinThreadId }: { kaolinThreadId: string | null }
      ) => {
        return {
          ...context,
          kaolinThreadId,
        };
      },
    },
  });

export const AiStoreContext = createContext<ReturnType<
  typeof createAiStore
> | null>(null);

function AiStoreProviderInner({
  children,
  initialActiveAgentId,
  agents,
}: {
  agents: {
    name: string;
    agentId: Id<"aiAgentPersona">;
    description: string;
  }[];
  children: React.ReactNode;
  initialActiveAgentId: Id<"aiAgentPersona"> | null;
}) {
  const store = useRef<ReturnType<typeof createAiStore> | null>(null);
  console.log("RENDERING AI STORE");
  if (!store.current) {
    store.current = createAiStore({
      initialActiveAgentId,
    });
  }

  // sync user choice to local storage
  useEffect(() => {
    if (!store.current) {
      return;
    }
    const activeAgentChanged = store.current.on(
      "activeAgentChanged",
      ({ agentId }) => {
        const validAgentId = getActiveAgentId({
          availableAgentIds: agents.map((agent) => agent.agentId),
          activeAgentId: agentId,
        });
        // not using hook to prevent re-render whenever the active agent changes
        localStorage.setItem(ACTIVE_AGENT_ID_STORAGE_KEY, `"${validAgentId}"`);
      }
    );

    return () => {
      activeAgentChanged.unsubscribe();
    };
  }, [agents, store.current]);

  return (
    <AiStoreContext.Provider value={store.current}>
      {children}
    </AiStoreContext.Provider>
  );
}

export function AiStoreProvider({ children }: { children: React.ReactNode }) {
  const agents = useQuery(convexQuery(api.product.ai.query.getAiPersonas, {}));
  const [activeAgentId] = useActiveAgentId();
  if (!agents.data) {
    return <PageLoadingSpinner />;
  }

  const initialActiveAgentId = getActiveAgentId({
    availableAgentIds: agents.data.map((agent) => agent._id),
    activeAgentId,
  });

  return (
    <AiStoreProviderInner
      agents={agents.data.map((agent) => ({
        name: agent.name,
        agentId: agent._id,
        description: agent.description || "",
      }))}
      initialActiveAgentId={initialActiveAgentId}
    >
      {children}
    </AiStoreProviderInner>
  );
}

export function useAiStore() {
  const store = useContext(AiStoreContext);
  if (!store) {
    throw new Error("useAiStore must be used within an AiStoreProvider");
  }
  return store;
}
