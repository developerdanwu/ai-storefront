import { useEffect } from "react";
import type { ToolDefinition } from "~/components/secondary-panel/ai/ai-store";
import { useAiStore } from "./ai-store";

export function KaolinTool({
  children,
  name,
  displayName,
  description,
  icon,
  context,
  callback,
}: {
  children: React.ReactNode;
} & ToolDefinition) {
  const aiStore = useAiStore();
  useEffect(() => {
    aiStore.send({
      type: "registerTool",
      tool: {
        name,
        displayName,
        description,
        icon,
        context,
        callback,
      } as ToolDefinition,
    });

    return () => {
      aiStore.send({
        type: "unregisterTool",
        key: "configure-agent",
      });
    };
  }, [name, displayName, description, icon, JSON.stringify(context), callback]);

  return <>{children}</>;
}
