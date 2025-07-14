import { useSelector } from "@xstate/store/react";
import { PlusIcon, XIcon } from "lucide-react";
import React from "react";
import { NewConversation } from "~/components/secondary-panel/ai/new-conversation";
import { AiThread } from "~/components/secondary-panel/ai/thread";
import { IconButton } from "../ui/icon-button";
import { useAiStore } from "./ai/ai-store";
import { useSecondarySidebar } from "./use-secondary-sidebar";

function SecondaryPanelWrapper({
  children,
  header,
  headerActions,
}: {
  children: React.ReactNode;
  header: React.ReactNode;
  headerActions?: React.ReactNode;
}) {
  const [sidebar, setSidebar] = useSecondarySidebar();
  return (
    <div className="w-[400px] flex-col flex shrink-0 border-l h-full">
      <div className="border-b p-2 flex items-center justify-between">
        <div className="flex-1 text-sm font-bold">{header}</div>
        <div className="flex items-center gap-1">
          {headerActions}
          <IconButton
            variant={"ghost"}
            size="sm"
            onClick={() => {
              setSidebar(null);
            }}
          >
            <XIcon />
          </IconButton>
        </div>
      </div>
      <div className="p-2 h-full">{children}</div>
    </div>
  );
}

function SecondaryPanelContent() {
  const [sidebar] = useSecondarySidebar();
  const aiSidebar = useAiStore();
  const threadId = useSelector(aiSidebar, (s) => s.context.threadId);

  if (!sidebar) {
    return null;
  }

  if (sidebar.type === "ai") {
    return (
      <SecondaryPanelWrapper
        header={"Kaolin AI"}
        headerActions={
          <>
            {!threadId ? (
              <IconButton variant={"ghost"} size="sm">
                <PlusIcon />
              </IconButton>
            ) : null}
          </>
        }
      >
        {threadId ? <AiThread threadId={threadId} /> : null}
        {!threadId ? <NewConversation /> : null}
      </SecondaryPanelWrapper>
    );
  }
}

export function SecondaryPanel() {
  return <SecondaryPanelContent />;
}
