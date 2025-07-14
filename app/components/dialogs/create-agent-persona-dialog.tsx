import { useConvexMutation } from "@convex-dev/react-query";
import { useMutation } from "@tanstack/react-query";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import React, { useCallback, useEffect } from "react";
import { useSearchParams } from "react-router";
import { toast } from "sonner";
import { z } from "zod";
import { useDialogStore } from "~/lib/dialog-store";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { useAppForm } from "../ui/tanstack-form";
import { Textarea } from "../ui/textarea";

const CreateAgentPersonaSchema = z.object({
  name: z.string().min(1, "Agent name is required"),
  description: z.string(),
});

type CreateAgentPersonaFormData = z.infer<typeof CreateAgentPersonaSchema>;

const DIALOG_NAME = "createAgentPersona";

export function CreateAgentPersonaDialog({
  onSuccess,
}: {
  onSuccess?: (agentId: { agentId: Id<"aiAgentPersona"> }) => void;
}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const isOpened = searchParams.get("dialog") === DIALOG_NAME;
  const store = useDialogStore();
  const createAgentPersona = useMutation({
    mutationFn: useConvexMutation(api.product.ai.mutation.createAiAgentPersona),
    onSuccess: (result: { agentId: Id<"aiAgentPersona"> }) => {
      onSuccess?.(result);
      store.trigger.closeCreateAgentPersonaDialog();
    },
    onError: (error) => {
      console.error(error);
      toast.error("Failed to create agent persona");
    },
  });

  useEffect(() => {
    const openListener = store.on("createAgentPersonaDialogOpened", () => {
      setSearchParams((prev) => {
        prev.set("dialog", DIALOG_NAME);
        return prev;
      });
    });

    const closeListener = store.on("createAgentPersonaDialogClosed", () => {
      setSearchParams((prev) => {
        prev.delete("dialog");
        return prev;
      });
    });

    return () => {
      openListener.unsubscribe();
      closeListener.unsubscribe();
    };
  }, [store, setSearchParams]);

  const form = useAppForm({
    validators: { onChange: CreateAgentPersonaSchema },
    defaultValues: {
      name: "",
      description: "",
    } as CreateAgentPersonaFormData,
    onSubmit: async ({ value }) => {
      form.reset();
      await createAgentPersona
        .mutateAsync({
          name: value.name,
          description: value.description,
        })
        .catch(() => {});
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

  const handleCancel = useCallback(() => {
    form.reset();
    store.trigger.closeCreateAgentPersonaDialog();
  }, [form, store]);

  return (
    <Dialog
      open={isOpened}
      onOpenChange={(open) => {
        if (open) {
          return store.trigger.openCreateAgentPersonaDialog();
        }
        return store.trigger.closeCreateAgentPersonaDialog();
      }}
    >
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Create New Agent Persona
          </DialogTitle>
          <DialogDescription>
            Create a custom AI agent with specific personality and behavior
            guidelines.
          </DialogDescription>
        </DialogHeader>

        <form.AppForm>
          <form onSubmit={handleSubmit} className="space-y-4">
            <form.AppField
              name="name"
              children={(field) => (
                <field.FormItem>
                  <field.FormLabel>Agent Name</field.FormLabel>
                  <field.FormControl>
                    <Input
                      placeholder="e.g., Marketing Assistant, Code Reviewer"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      autoFocus
                    />
                  </field.FormControl>
                  <field.FormDescription>
                    Choose a descriptive name for your agent
                  </field.FormDescription>
                  <field.FormMessage />
                </field.FormItem>
              )}
            />
            <form.AppField
              name="description"
              children={(field) => (
                <field.FormItem>
                  <field.FormLabel>Description</field.FormLabel>
                  <field.FormControl>
                    <Textarea
                      placeholder="Describe what this agent does and how it should behave..."
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      rows={3}
                    />
                  </field.FormControl>
                  <field.FormDescription>
                    Optional description of the agent's purpose and behavior
                  </field.FormDescription>
                  <field.FormMessage />
                </field.FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button loading={createAgentPersona.isPending} type="submit">
                Create Agent
              </Button>
            </DialogFooter>
          </form>
        </form.AppForm>
      </DialogContent>
    </Dialog>
  );
}
