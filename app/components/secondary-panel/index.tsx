import { useSelector } from "@xstate/react";
import { ClockIcon, PlusIcon, XIcon } from "lucide-react";
import React from "react";
import { NewConversation } from "~/components/secondary-panel/ai/new-conversation";
import { AiThread } from "~/components/secondary-panel/ai/thread";
import { useDialogStore } from "~/lib/dialog-store";
import { KaolinThreadsDialog } from "../dialogs/kaolin-thread-dialog";
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
  const [_, setSidebar] = useSecondarySidebar();
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
      <div className="p-2 h-full flex flex-col">{children}</div>
    </div>
  );
}

function SecondaryPanelContent() {
  const [sidebar] = useSecondarySidebar();
  const aiSidebar = useAiStore();
  const kaolinThreadId = useSelector(
    aiSidebar,
    (s) => s.context.kaolinThreadId
  );
  const dialogStore = useDialogStore();
  if (!sidebar) {
    return null;
  }

  if (sidebar.type === "ai") {
    return (
      <SecondaryPanelWrapper
        header={"Kaolin AI"}
        headerActions={
          <>
            <IconButton
              variant={"ghost"}
              size="sm"
              onClick={() => {
                dialogStore.trigger.openKaolinThreadsDialog();
              }}
            >
              <ClockIcon />
            </IconButton>
            {!kaolinThreadId ? (
              <IconButton variant={"ghost"} size="sm">
                <PlusIcon />
              </IconButton>
            ) : (
              <IconButton
                variant={"ghost"}
                size="sm"
                onClick={() => {
                  aiSidebar.send({
                    type: "setKaolinThreadId",
                    kaolinThreadId: null,
                  });
                }}
              >
                <PlusIcon />
              </IconButton>
            )}
          </>
        }
      >
        {kaolinThreadId ? <AiThread threadId={kaolinThreadId} /> : null}
        {!kaolinThreadId ? <NewConversation /> : null}
        <KaolinThreadsDialog
          onSelect={(threadId) => {
            console.log("Selected Kaolin thread:", threadId);
            // Handle Kaolin thread selection
            aiSidebar.send({
              type: "setKaolinThreadId",
              kaolinThreadId: threadId,
            });
          }}
          onClose={() => {}}
        />
      </SecondaryPanelWrapper>
    );
  }
}

export function SecondaryPanel() {
  return <SecondaryPanelContent />;
}
