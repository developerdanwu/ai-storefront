import { SparklesIcon } from "lucide-react";
import { IconButton } from "../ui/icon-button";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { useSecondarySidebar } from "./use-secondary-sidebar";

export function RightNavbar() {
  const [value, __, toggle] = useSecondarySidebar();
  const sidebar = value;

  return (
    <div
      className={
        "flex gap-2.5 shrink-0 bg-background flex-col py-2 items-center w-12 border-l h-full"
      }
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <IconButton
            size="default"
            variant={"ghost"}
            pressed={sidebar?.type === "ai"}
            onClick={() => {
              toggle({
                type: "ai",
              });
            }}
          >
            <SparklesIcon className="text-purple-500 dark:text-purple-400" />
          </IconButton>
        </TooltipTrigger>
        <TooltipContent side="left">Ask Kaolin AI</TooltipContent>
      </Tooltip>
    </div>
  );
}
