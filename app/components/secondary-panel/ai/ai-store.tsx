import { convexQuery } from "@convex-dev/react-query";
import { useQuery } from "@tanstack/react-query";
import { createActorContext } from "@xstate/react";
import type { ToolCallPart } from "ai";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import type { tools } from "convex/agents/kaolinAgent";
import { ArrowRightIcon } from "lucide-react";
import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { assign, enqueueActions, setup } from "xstate";
import z from "zod";
import {
  ACTIVE_AGENT_ID_STORAGE_KEY,
  useActiveAgentId,
} from "~/components/secondary-panel/ai/utils";
import { PageLoadingSpinner } from "~/components/ui/page-loading-spinner";
import { ROUTES } from "~/lib/routes";
import { getActiveAgentId } from "./utils";

export type ClientTools = "configure-agent" | "navigate";

export type Tools = {
  [K in keyof typeof tools]: {
    name: K;
    displayName: string;
    description: string;
    icon?: React.ElementType;
    context: Record<string, any>;
    callback: (
      toolOutput: z.infer<(typeof tools)[K]["parameters"]>
    ) => void | Promise<void>;
  };
};

export type ToolDefinition = Tools[keyof Tools];

const aiStoreMachine = setup({
  types: {
    input: {} as {
      initialActiveAgentId: Id<"aiAgentPersona"> | null;
    },
    context: {} as {
      toolMap: Partial<Tools>;
      toolCalledlMap: string[];
      activeAgentId: Id<"aiAgentPersona"> | null;
      playgroundThreadId: string | null;
      kaolinThreadId: string | null;
    },
    emitted: {} as
      | {
          type: "activeAgentChanged";
          agentId: Id<"aiAgentPersona">;
        }
      | {
          type: "onToolCall";
          toolInvocationPart: ToolCallPart;
          messageId: string;
          clientTool: ToolDefinition;
        },
    events: {} as
      | {
          type: "toolCalled";
          toolInvocationPart: ToolCallPart;
          messageId: string;
        }
      | {
          type: "setActiveAgent";
          agentId: Id<"aiAgentPersona">;
        }
      | {
          type: "registerTool";
          tool: ToolDefinition;
        }
      | {
          type: "unregisterTool";
          key: string;
        }
      | {
          type: "setPlaygroundThreadId";
          playgroundThreadId: string | null;
        }
      | {
          type: "setKaolinThreadId";
          kaolinThreadId: string | null;
        }
      | {
          type: "toolCallInProgress";
        }
      | {
          type: "toolCallCompleted";
        },
  },
}).createMachine({
  context: ({ input }) => ({
    toolMap: {},
    toolCalledlMap: [],
    activeAgentId: input.initialActiveAgentId,
    playgroundThreadId: null,
    kaolinThreadId: null,
  }),
  type: "parallel",
  states: {
    toolCall: {
      initial: "idle",
      states: {
        idle: {
          on: {
            toolCalled: {
              target: "toolCallInProgress",
              actions: [
                enqueueActions(
                  ({
                    context,
                    event: { toolInvocationPart, messageId },
                    enqueue,
                  }) => {
                    const clientTool =
                      context.toolMap[
                        toolInvocationPart.toolName as keyof Tools
                      ];

                    if (clientTool) {
                      enqueue.emit({
                        type: "onToolCall",
                        toolInvocationPart,
                        messageId,
                        clientTool,
                      });
                    }
                  }
                ),
              ],
            },
          },
        },
        toolCallInProgress: {
          on: {
            toolCallCompleted: {
              target: "idle",
            },
          },
        },
      },
    },
  },
  on: {
    setActiveAgent: {
      actions: [
        enqueueActions(({ context, event: { agentId }, enqueue }) => {
          enqueue.emit({ type: "activeAgentChanged", agentId });
          enqueue.assign({
            activeAgentId: agentId,
          });
        }),
      ],
    },
    registerTool: {
      actions: [
        assign(({ context, event }) => {
          return {
            ...context,
            toolMap: {
              ...context.toolMap,
              [event.tool.name]: event.tool,
            },
          };
        }),
      ],
    },
    unregisterTool: {
      actions: [
        assign({
          toolMap: ({ event, context }) => {
            const newState = { ...context.toolMap };
            delete newState[event.key as keyof typeof newState];
            return newState;
          },
        }),
      ],
    },
    setPlaygroundThreadId: {
      actions: [
        assign({
          playgroundThreadId: ({ event }) => event.playgroundThreadId,
        }),
      ],
    },
    setKaolinThreadId: {
      actions: [
        assign({
          kaolinThreadId: ({ event }) => event.kaolinThreadId,
        }),
      ],
    },
  },
});

const AiStoreActorContext = createActorContext(aiStoreMachine);

function AiStoreProviderInner({
  children,
  agents,
}: {
  agents: {
    name: string;
    agentId: Id<"aiAgentPersona">;
    description: string;
  }[];
  children: React.ReactNode;
}) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const aiStore = useAiStore();
  // sync user choice to local storage
  useEffect(() => {
    const activeAgentChanged = aiStore.on(
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
  }, [agents, aiStore]);

  useEffect(() => {
    aiStore.send({
      type: "registerTool",
      tool: {
        name: "navigate",
        displayName: "Navigate",
        description: "Navigate to a new page",
        icon: ArrowRightIcon,
        context: {
          currentUrl: pathname,
          availableRoutes: {
            agents: {
              path: ROUTES.appAgents,
              description: "Main agents configuration page",
            },
            appSettings: {
              path: ROUTES.appSettings,
              description: "Main settings page",
            },
          },
        },
        callback: async (toolOutput) => {
          await navigate(toolOutput.uiPayload.route);
        },
      },
    });
  }, [aiStore, navigate, pathname]);

  return <>{children}</>;
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
    <AiStoreActorContext.Provider
      options={{
        input: {
          initialActiveAgentId,
        },
      }}
    >
      <AiStoreProviderInner
        agents={agents.data.map((agent) => ({
          name: agent.name,
          agentId: agent._id,
          description: agent.description || "",
        }))}
      >
        {children}
      </AiStoreProviderInner>
    </AiStoreActorContext.Provider>
  );
}

export function useAiStore() {
  return AiStoreActorContext.useActorRef();
}
