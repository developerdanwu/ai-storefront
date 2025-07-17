import { useConvexMutation } from "@convex-dev/react-query";
import { useStore } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { diffWordsWithSpace } from "diff";
import React, { useCallback, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { KaolinTool } from "~/components/secondary-panel/ai/kaolin-tool";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { useAppForm } from "~/components/ui/tanstack-form";
import { Textarea } from "~/components/ui/textarea";
import { useBlockNavigation } from "~/lib/use-block-navigation";
import { cn } from "~/lib/utils";

export function Settings({
  defaultValues,
  agentId,
}: {
  defaultValues: {
    name: string;
    customPrompt: string;
  };
  agentId: Id<"aiAgentPersona">;
}) {
  const [diffPreview, setDiffPreview] = useState<{
    oldPrompt: string;
    newPrompt: string;
    isShowing: boolean;
  }>({
    oldPrompt: "",
    newPrompt: "",
    isShowing: false,
  });

  const formSchema = z.object({
    name: z.string().min(1, "Agent name is required"),
    customPrompt: z.string(),
    agentId: z.custom(() => {
      return !!agentId;
    }),
  });

  const updateAgent = useMutation({
    mutationFn: useConvexMutation(api.product.ai.mutation.updateAiAgentPersona),
    onSuccess: () => {
      form.reset();
      toast.success("Agent updated");
    },
    onError: () => {
      toast.error("Failed to update agent");
    },
  });

  const form = useAppForm({
    validators: {
      onMount: formSchema,
      onChange: formSchema,
    },
    defaultValues,
    onSubmit: async ({ value }) => {
      await updateAgent.mutateAsync({
        agentId,
        name: value.name,
        customPrompt: value.customPrompt,
      });
    },
  });

  const customPrompt = useStore(
    form.store,
    (state) => state.values.customPrompt
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      e.stopPropagation();
      form.handleSubmit();
    },
    [form]
  );

  const isSubmitting = useStore(form.store, (state) => state.isSubmitting);
  const isFormValid = useStore(form.store, (state) => state.isValid);
  const isDirty = useStore(form.store, (state) => state.isDirty);

  useBlockNavigation({
    shouldBlockRouteChange: isDirty,
    shouldBlockBeforeUnload: isDirty,
  });

  const handleDiffAccept = useCallback(() => {
    form.setFieldValue("customPrompt", diffPreview.newPrompt);
    setDiffPreview((prev) => ({ ...prev, isShowing: false }));
  }, [form, diffPreview.newPrompt]);

  const handleDiffReject = useCallback(() => {
    setDiffPreview((prev) => ({ ...prev, isShowing: false }));
  }, []);

  const renderDiff = useCallback((oldText: string, newText: string) => {
    const diff = diffWordsWithSpace(oldText, newText);

    return (
      <div className="font-mono text-sm whitespace-pre-wrap max-h-96 overflow-y-auto border rounded-md p-4 bg-muted/30">
        {diff.map((part, index) => (
          <span
            key={index}
            className={cn(
              part.added &&
                "bg-green-200 text-green-800 dark:bg-green-900/30 dark:text-green-300",
              part.removed &&
                "bg-red-200 text-red-800 dark:bg-red-900/30 dark:text-red-300 line-through"
            )}
          >
            {part.value}
          </span>
        ))}
      </div>
    );
  }, []);

  return (
    <KaolinTool
      name="configure-agent"
      displayName="Configure Agent"
      description="Kaolin AI can configure the agent"
      context={{
        agentId,
        customPrompt,
      }}
      callback={(llmOutput: { customPrompt: string }) => {
        const oldPrompt = customPrompt;
        const newPrompt = llmOutput.customPrompt;

        if (oldPrompt !== newPrompt) {
          setDiffPreview({
            oldPrompt,
            newPrompt,
            isShowing: true,
          });
        } else {
          toast.info("No changes detected in the prompt");
        }
      }}
    >
      <form.AppForm>
        <form onSubmit={handleSubmit} className="space-y-6">
          <form.AppField
            name="name"
            children={(field) => (
              <field.FormItem>
                <field.FormLabel>Agent Name</field.FormLabel>
                <field.FormControl>
                  <Input
                    placeholder="Enter agent name"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                  />
                </field.FormControl>
                <field.FormDescription>
                  This is how your agent will introduce itself to users
                </field.FormDescription>
                <field.FormMessage />
              </field.FormItem>
            )}
          />

          <form.AppField
            name="customPrompt"
            children={(field) => (
              <field.FormItem>
                <field.FormLabel>Custom Prompt</field.FormLabel>
                {diffPreview.isShowing ? (
                  <div className="space-y-4 p-4 border-2 border-amber-200 dark:border-amber-800 rounded-lg bg-amber-50/50 dark:bg-amber-950/20">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                      <div className="text-sm font-medium text-amber-800 dark:text-amber-200">
                        AI Suggested Changes
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-2">
                        Green text indicates additions, red text indicates
                        deletions:
                      </div>
                      {renderDiff(diffPreview.oldPrompt, diffPreview.newPrompt)}
                    </div>
                    <div className="flex gap-3 pt-2 border-t border-amber-200 dark:border-amber-800">
                      <Button
                        type="button"
                        onClick={handleDiffAccept}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        Accept Changes
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleDiffReject}
                        size="sm"
                        className="border-red-300 text-red-700 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-950/20"
                      >
                        Reject Changes
                      </Button>
                    </div>
                  </div>
                ) : (
                  <field.FormControl>
                    <Textarea
                      placeholder="Enter custom instructions for your agent"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      rows={16}
                      className="font-mono text-sm"
                    />
                  </field.FormControl>
                )}
                <field.FormDescription>
                  Define how your agent should behave, its personality, and
                  response guidelines
                </field.FormDescription>
                <field.FormMessage />
              </field.FormItem>
            )}
          />

          {!diffPreview.isShowing && (
            <div className="flex gap-3">
              <Button
                disabled={!isFormValid}
                loading={isSubmitting}
                type="submit"
              >
                Save Settings
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => form.reset()}
              >
                Reset to Default
              </Button>
            </div>
          )}
        </form>
      </form.AppForm>
    </KaolinTool>
  );
}
