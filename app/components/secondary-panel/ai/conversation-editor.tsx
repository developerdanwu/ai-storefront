import { useConvexAction } from "@convex-dev/react-query";
import { useStore } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { useSelector } from "@xstate/store/react";
import { api } from "convex/_generated/api";
import { isHotkey } from "is-hotkey";
import { Send, Wrench } from "lucide-react";
import { useCallback } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { AnimatingEllipsis } from "~/components/ui/animating-ellipsis";
import { IconButton } from "~/components/ui/icon-button";
import { useAppForm } from "~/components/ui/tanstack-form";
import { Textarea } from "~/components/ui/textarea";
import { cn } from "~/lib/utils";
import { useAiStore } from "./ai-store";

const KaolinMessageSchema = z.object({
  message: z.string().min(1, "Message is required"),
});

export function AiConversationEditor() {
  const aiStore = useAiStore();
  const toolsAvailable = useSelector(aiStore, (s) => s.context.toolMap);
  const kaolinThreadId = useSelector(aiStore, (s) => s.context.kaolinThreadId);
  const form = useAppForm({
    validators: {
      onChange: KaolinMessageSchema,
      onMount: KaolinMessageSchema,
    },
    defaultValues: {
      message: "",
    },
    onSubmit: async ({ value }) => {
      if (kaolinThreadId) {
        // Continue existing thread
        await continueKaolinThread.mutateAsync({
          threadId: kaolinThreadId,
          prompt: value.message,
        });
      } else {
        // Create new thread
        await createKaolinThread.mutateAsync({
          prompt: value.message,
        });
      }
    },
  });

  const createKaolinThread = useMutation({
    mutationFn: useConvexAction(api.product.ai.action.createKaolinThread),
    onSuccess: (
      result: { threadId: string },
      { prompt }: { prompt: string }
    ) => {
      // Reset form after successful creation
      form.reset();

      // Set the thread ID in the store
      aiStore.trigger.setKaolinThreadId({
        kaolinThreadId: result.threadId,
      });

      // Continue with the initial prompt
      continueKaolinThread.mutate({
        threadId: result.threadId,
        prompt,
      });
    },
    onError: (error) => {
      toast.error("Failed to create thread");
      console.error(error);
    },
  });

  const continueKaolinThread = useMutation({
    mutationFn: useConvexAction(api.product.ai.action.continueKaolinThread),
    onMutate: () => {
      form.reset();
    },
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

  const isValid = useStore(form.store, (state) => state.isValid);
  const isSubmitting = useStore(form.store, (state) => state.isSubmitting);
  const isGenerating =
    createKaolinThread.isPending || continueKaolinThread.isPending;
  const sendButtonDisabled = !isValid || isSubmitting || isGenerating;

  return (
    <div className="flex flex-col">
      {isGenerating && (
        <div className="px-1">
          <div
            className={
              "text-sm bg-muted gap-2 px-3 -mb-1 flex items-center justify-between bg-background-muted w-full h-8 rounded-t-md"
            }
          >
            <p className={"text-primary text-xs font-semibold"}>
              Generating
              <AnimatingEllipsis />
            </p>
          </div>
        </div>
      )}

      <form.AppForm>
        <form onSubmit={handleSubmit}>
          <div
            className={cn(
              "bg-muted flex flex-col gap-2 focus:border-background-emphasis focus-visible:outline-0 focus-visible:border-background-emphasis focus-within:border-background-emphasis border rounded-lg p-1 relative"
            )}
          >
            <div className="flex w-full bg-background p-2 rounded-md">
              <div className="flex-[1_1_0px] w-full">
                <form.AppField
                  name="message"
                  children={(field) => (
                    <field.FormItem className="flex-1 w-full">
                      <field.FormControl>
                        <Textarea
                          variant={"ghost"}
                          className="resize-none flex-1 border-none shadow-none focus-visible:ring-0"
                          placeholder={
                            kaolinThreadId
                              ? "Continue the conversation..."
                              : "Start a new conversation..."
                          }
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          onBlur={field.handleBlur}
                          disabled={isSubmitting}
                          onKeyDown={(e) => {
                            if (isHotkey("enter", e)) {
                              e.preventDefault();
                              e.stopPropagation();
                              form.handleSubmit();
                            }
                          }}
                        />
                      </field.FormControl>
                    </field.FormItem>
                  )}
                />
              </div>
              <div className="flex justify-end items-center gap-2 self-end">
                <IconButton
                  size="sm"
                  type="submit"
                  disabled={sendButtonDisabled}
                  loading={isSubmitting}
                >
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
        </form>
      </form.AppForm>
    </div>
  );
}
