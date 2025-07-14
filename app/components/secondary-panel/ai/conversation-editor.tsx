import { useSelector } from "@xstate/store/react";
import { Send, Wrench } from "lucide-react";
import { AnimatingEllipsis } from "~/components/ui/animating-ellipsis";
import { IconButton } from "~/components/ui/icon-button";
import { Textarea } from "~/components/ui/textarea";
import { cn } from "~/lib/utils";
import { useAiStore } from "./ai-store";

export function AiConversationEditor() {
  const isGenerating = false;
  const aiStore = useAiStore();
  const toolsAvailable = useSelector(aiStore, (s) => s.context.toolMap);
  return (
    <div className="flex flex-col">
      {isGenerating ? (
        <div>
          <div
            className={
              "text-sm gap-2 px-3 -mb-1 flex items-center justify-between bg-background-muted w-full h-8 rounded-t-md"
            }
          >
            <p className={"text-primary text-xs font-semibold"}>
              Generating
              <AnimatingEllipsis />
            </p>
          </div>
        </div>
      ) : null}

      <div
        className={cn(
          "bg-muted flex flex-col gap-2 focus:border-background-emphasis focus-visible:outline-0 focus-visible:border-background-emphasis focus-within:border-background-emphasis border rounded-lg p-1 relative"
        )}
      >
        <div className="flex w-full bg-background p-2 rounded-md">
          <div className="flex-[1_1_0px] w-full">
            <Textarea
              variant={"ghost"}
              className="resize-none flex-1 border-none shadow-none focus-visible:ring-0"
            />
          </div>
          <div className="flex justify-end items-center gap-2 self-end">
            <IconButton size="sm">
              <Send />
            </IconButton>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Tools here:
          {Object.entries(toolsAvailable).map(([key, tool]) => {
            return (
              <span className="px-0.5 italic" key={key}>
                {tool.icon ? (
                  tool.icon
                ) : (
                  <Wrench
                    size={16}
                    className="mx-1.5 align-middle inline-block"
                  />
                )}
                {tool.displayName}
              </span>
            );
          })}
        </p>
      </div>
    </div>
  );
}
