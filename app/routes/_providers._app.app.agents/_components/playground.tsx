import { useThreadMessages } from "@convex-dev/agent/react";
import { useConvexAction } from "@convex-dev/react-query";
import { useStore } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { useSelector } from "@xstate/react";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { isHotkey } from "is-hotkey";
import { Bot, ClockIcon, PlusIcon, Send } from "lucide-react";
import { useCallback, useRef } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { useAiStore } from "~/components/secondary-panel/ai/ai-store";
import { ThreadMessages } from "~/components/thread-messages";
import { IconButton } from "~/components/ui/icon-button";
import { useAppForm } from "~/components/ui/tanstack-form";
import { Textarea } from "~/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { useDialogStore } from "~/lib/dialog-store";

function PlaygroundThread({
  threadId,
  activeAgent,
}: {
  threadId: string;
  activeAgent: { agentId: Id<"aiAgentPersona"> } | null;
}) {
  const shouldStickToBottomRef = useRef(true);
  const continuePlaygroundThread = useMutation({
    mutationFn: useConvexAction(api.product.ai.action.continuePlaygroundThread),
    onMutate: () => {
      form.reset();
    },
    onError: (error) => {
      toast.error("Failed to send message");
      console.error(error);
    },
  });
  const form = useAppForm({
    validators: { onChange: PlaygroundMessageSchema },
    defaultValues: {
      message: "",
    },
    onSubmit: async ({ value }) => {
      await continuePlaygroundThread.mutateAsync({
        aiAgentPersonaId: activeAgent!.agentId,
        threadId: threadId,
        prompt: value.message,
      });
    },
  });
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      e.stopPropagation();
      form.handleSubmit();
    },
    [form]
  );
  const messages = useThreadMessages(
    api.product.ai.query.getPlaygroundThreadMessages,
    {
      threadId: threadId!,
    },
    {
      initialNumItems: 10,
      stream: true,
    }
  );

  const isSubmitting = useStore(form.store, (state) => state.isSubmitting);

  return (
    <>
      <ThreadMessages
        messages={messages}
        isStreaming={false}
        shouldStickToBottomRef={shouldStickToBottomRef}
        className="p-4"
      />
      <div className="p-4 border-t flex justify-center items-center">
        <form.AppForm>
          <form onSubmit={handleSubmit} className="flex gap-2 w-full max-w-3xl">
            <form.AppField
              name="message"
              children={(field) => (
                <field.FormItem className="flex-1 w-full">
                  <field.FormControl className="w-full">
                    <Textarea
                      onKeyDown={(e) => {
                        if (isHotkey("enter", e)) {
                          e.preventDefault();
                          e.stopPropagation();
                          form.handleSubmit();
                        }
                      }}
                      placeholder="Type a test message..."
                      rows={2}
                      className="flex-1 resize-none"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      disabled={isSubmitting}
                    />
                  </field.FormControl>
                  <field.FormMessage />
                </field.FormItem>
              )}
            />
            <IconButton
              type="submit"
              disabled={isSubmitting}
              loading={isSubmitting}
            >
              <Send />
            </IconButton>
          </form>
        </form.AppForm>
      </div>
    </>
  );
}

const PlaygroundMessageSchema = z.object({
  message: z.string().min(1, "Message is required"),
});

function NewPlaygroundThread({
  activeAgent,
}: {
  activeAgent: {
    name: string;
    agentId: Id<"aiAgentPersona">;
  } | null;
}) {
  const aiStore = useAiStore();

  const form = useAppForm({
    validators: { onChange: PlaygroundMessageSchema },
    defaultValues: {
      message: "",
    },
    onSubmit: ({ value }) => {
      if (!activeAgent) return;

      createPlaygroundThread.mutate({
        aiAgentPersonaId: activeAgent.agentId,
        prompt: value.message,
      });
    },
  });

  const createPlaygroundThread = useMutation({
    mutationFn: useConvexAction(api.product.ai.action.createPlaygroundThread),
    onSuccess: (
      result: { threadId: string },
      { prompt }: { prompt: string; aiAgentPersonaId: Id<"aiAgentPersona"> }
    ) => {
      // Reset form after successful creation
      form.reset();

      // Set the thread ID in the store so the PlaygroundThread component can render
      aiStore.send({
        type: "setPlaygroundThreadId",
        playgroundThreadId: result.threadId,
      });

      continuePlaygroundThread.mutate({
        aiAgentPersonaId: activeAgent!.agentId,
        threadId: result.threadId,
        prompt,
      });
    },
    onError: (error) => {
      toast.error("Failed to create playground thread");
      console.error(error);
    },
  });

  const continuePlaygroundThread = useMutation({
    mutationFn: useConvexAction(api.product.ai.action.continuePlaygroundThread),
    onSuccess: () => {},
    onError: (error) => {
      toast.error("Failed to send message");
      console.error(error);
    },
  });

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      e.stopPropagation();
      form.handleSubmit();
    },
    [form]
  );

  const isSubmitting =
    createPlaygroundThread.isPending || continuePlaygroundThread.isPending;

  if (!activeAgent) {
    return (
      <>
        <div className="flex-[1_1_0px] h-0 flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <p>Select an agent to start testing</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="flex-[1_1_0px] h-0 flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <p>Start a conversation with {activeAgent.name}</p>
        </div>
      </div>
      <div className="p-4 border-t flex justify-center items-center w-full">
        <form.AppForm>
          <form onSubmit={handleSubmit} className="flex gap-2 w-full max-w-3xl">
            <form.AppField
              name="message"
              children={(field) => (
                <field.FormItem className="flex-1">
                  <field.FormControl>
                    <Textarea
                      placeholder="Type a test message..."
                      rows={2}
                      onKeyDown={(e) => {
                        if (isHotkey("enter", e)) {
                          e.preventDefault();
                          e.stopPropagation();
                          form.handleSubmit();
                        }
                      }}
                      className="flex-1 resize-none"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      disabled={isSubmitting}
                    />
                  </field.FormControl>
                  <field.FormMessage />
                </field.FormItem>
              )}
            />
            <IconButton
              type="submit"
              disabled={isSubmitting}
              loading={isSubmitting}
            >
              <Send />
            </IconButton>
          </form>
        </form.AppForm>
      </div>
    </>
  );
}

export function Playground({
  activeAgent,
}: {
  activeAgent: {
    name: string;
    agentId: Id<"aiAgentPersona">;
  } | null;
}) {
  const aiStore = useAiStore();
  const dialogStore = useDialogStore();
  const activeThreadId = useSelector(
    aiStore,
    (state) => state.context.playgroundThreadId
  );
  return (
    <div className="h-full flex-[1_1_0px] flex flex-col">
      <div className="p-6 border-b">
        <div className="flex items-center justify-between mb-2 ">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Bot className="w-5 h-5" />
            Playground
          </h1>
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger>
                <IconButton
                  onClick={() => {
                    dialogStore.trigger.openPlaygroundThreadsDialog();
                  }}
                  variant="ghost"
                >
                  <ClockIcon />
                </IconButton>
              </TooltipTrigger>
              <TooltipContent side="bottom">Thread history</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger>
                <IconButton
                  onClick={() => {
                    aiStore.send({
                      type: "setPlaygroundThreadId",
                      playgroundThreadId: null,
                    });
                  }}
                  variant="ghost"
                >
                  <PlusIcon />
                </IconButton>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                Create a new playground thread
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        <p className="text-muted-foreground text-sm">
          Test your agent configuration in real-time
        </p>
      </div>

      {/* Current Agent Info */}
      <div className="p-4 bg-muted/50 border-b">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-sm text-muted-foreground">Testing:</span>
          <span className="font-medium">{activeAgent?.name}</span>
        </div>
      </div>

      {activeThreadId ? (
        <PlaygroundThread threadId={activeThreadId} activeAgent={activeAgent} />
      ) : (
        <NewPlaygroundThread activeAgent={activeAgent} />
      )}
    </div>
  );
}
