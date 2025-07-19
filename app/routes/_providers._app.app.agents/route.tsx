import { convexQuery } from "@convex-dev/react-query";
import { useQuery } from "@tanstack/react-query";
import { useSelector } from "@xstate/react";
import { api } from "convex/_generated/api";
import { PlaygroundThreadsDialog } from "~/components/dialogs/playground-thread-dialog";
import { useAiStore } from "~/components/secondary-panel/ai/ai-store";
import { Playground } from "~/routes/_providers._app.app.agents/_components/playground";
import { AgentSwitcher } from "./_components/agent-switcher";
import { Settings } from "./_components/settings";

export default function AppAgentsRoute() {
  const agents = useQuery(convexQuery(api.product.ai.query.getAiPersonas, {}));

  const aiStore = useAiStore();
  const activeAgentId = useSelector(aiStore, (s) => s.context.activeAgentId);
  const activeAgent = agents.data?.find((agent) => agent._id === activeAgentId);

  return (
    <div className="flex h-full">
      {/* Settings Panel - Left Side */}

      <div className="w-92 p-6 shrink-0 border-r overflow-y-auto">
        <AgentSwitcher
          activeAgent={
            activeAgent
              ? {
                  name: activeAgent.name,
                  agentId: activeAgent._id,
                }
              : null
          }
          agents={
            agents.data?.map((agent) => ({
              name: agent.name,
              agentId: agent._id,
            })) || []
          }
        />
        {activeAgent ? (
          <Settings
            defaultValues={{
              name: activeAgent.name,
              customPrompt: activeAgent.customPrompt || "",
            }}
            agentId={activeAgent._id}
          />
        ) : null}
      </div>
      <Playground
        activeAgent={
          activeAgent
            ? {
                name: activeAgent.name,
                agentId: activeAgent._id,
              }
            : null
        }
      />
      <PlaygroundThreadsDialog
        onSelect={(threadId) => {
          aiStore.send({
            type: "setPlaygroundThreadId",
            playgroundThreadId: threadId,
          });
        }}
        onClose={() => {}}
      />
    </div>
  );
}
