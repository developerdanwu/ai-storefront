import { useConvexMutation } from "@convex-dev/react-query";
import { useMutation } from "@tanstack/react-query";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { Bot, ChevronDown, Plus, Trash2 } from "lucide-react";
import { useCallback } from "react";
import { toast } from "sonner";
import { CreateAgentPersonaDialog } from "~/components/dialogs/create-agent-persona-dialog";
import { useAiStore } from "~/components/secondary-panel/ai/ai-store";
import { KaolinTool } from "~/components/secondary-panel/ai/kaolin-tool";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { useDialogStore } from "~/lib/dialog-store";

export function AgentSwitcher({
  agents,
  activeAgent,
}: {
  activeAgent: {
    name: string;
    agentId: Id<"aiAgentPersona">;
  } | null;
  agents: {
    name: string;
    agentId: Id<"aiAgentPersona">;
  }[];
}) {
  const aiStore = useAiStore();
  const dialogStore = useDialogStore();
  const deleteAgent = useMutation({
    mutationKey: ["delete-agent"],
    mutationFn: useConvexMutation(api.product.ai.mutation.deleteAiAgentPersona),
    onSuccess: () => {
      dialogStore.trigger.closeAlertDialogWithConfirmKeyword();
      toast.success("Agent deleted");
    },
  });
  const handleDeleteAgent = useCallback(
    (agentId: Id<"aiAgentPersona">) => {
      dialogStore.trigger.openAlertDialogWithConfirmKeyword({
        title: "Delete Agent",
        disableCloseOnConfirm: true,
        confirmButtonMutationKeys: [["delete-agent"]],
        description:
          "Are you sure you want to delete this agent? This action cannot be undone.",
        onConfirm: () => {
          deleteAgent.mutate({
            agentId,
          });
        },
      });
    },
    [deleteAgent, dialogStore]
  );
  return (
    <>
      <CreateAgentPersonaDialog
        onSuccess={({ agentId }) => {
          aiStore.trigger.setActiveAgent({
            agentId,
          });
        }}
      />
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          {/* Agent Switcher Dropdown */}
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <KaolinTool
                name="configure-agent"
                displayName="Configure Agent"
                description="Kaolin AI can configure the agent"
                context={{}}
                callback={(llmOutput) => {}}
              >
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Bot className="w-4 h-4" />
                    <span className="max-w-[150px] truncate">
                      {activeAgent?.name || "Please select an agent"}
                    </span>
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
              </KaolinTool>
              <DropdownMenuContent align="start" className="w-64">
                <div className="p-2 text-xs text-muted-foreground font-medium">
                  SELECT AGENT
                </div>
                {agents.map((agent) => (
                  <DropdownMenuItem
                    key={agent.agentId}
                    onSelect={() => {
                      aiStore.trigger.setActiveAgent({
                        agentId: agent.agentId,
                      });
                    }}
                    className={`flex items-center gap-2 ${
                      activeAgent?.agentId === agent.agentId ? "bg-muted" : ""
                    }`}
                  >
                    <Bot className="w-4 h-4" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{agent.name}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0 opacity-70 hover:opacity-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteAgent(agent.agentId);
                      }}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    dialogStore.trigger.openCreateAgentPersonaDialog();
                  }}
                  className="flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Create New Agent
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <p className="text-muted-foreground text-sm">
          Configure {activeAgent?.name || "Please select an agent"}'s behavior
          and personality
        </p>
      </div>
    </>
  );
}
