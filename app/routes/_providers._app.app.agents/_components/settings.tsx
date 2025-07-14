import { useConvexMutation } from "@convex-dev/react-query";
import { useStore } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import React, { useCallback } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { useAppForm } from "~/components/ui/tanstack-form";
import { Textarea } from "~/components/ui/textarea";

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

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      e.stopPropagation();
      form.handleSubmit();
    },
    [form]
  );

  const isFormValid = useStore(form.store, (state) => state.isValid);

  return (
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
              <field.FormDescription>
                Define how your agent should behave, its personality, and
                response guidelines
              </field.FormDescription>
              <field.FormMessage />
            </field.FormItem>
          )}
        />

        <div className="flex gap-3">
          <Button disabled={!isFormValid} type="submit">
            Save Settings
          </Button>
          <Button type="button" variant="outline" onClick={() => form.reset()}>
            Reset to Default
          </Button>
        </div>
      </form>
    </form.AppForm>
  );
}
