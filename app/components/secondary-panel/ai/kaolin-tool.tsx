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
    aiStore.trigger.registerTool({
      tool: {
        name,
        displayName,
        description,
        icon,
        context,
        callback,
      },
    });

    return () => {
      aiStore.trigger.unregisterTool({
        key: "configure-agent",
      });
    };
  }, [name, displayName, description, icon, JSON.stringify(context), callback]);

  return <>{children}</>;
}
