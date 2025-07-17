import { useStore } from "@tanstack/react-form";
import { diffWordsWithSpace } from "diff";
import React, { useCallback, useMemo } from "react";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { useAppForm } from "~/components/ui/tanstack-form";
import { Textarea } from "~/components/ui/textarea";
import { cn } from "~/lib/utils";

const PromptFormSchema = z.object({
  editablePrompt: z.string(),
});

interface PromptDiffPreviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: (newPrompt: string) => void;
  oldPrompt: string;
  initialNewPrompt: string;
}

export function PromptDiffPreviewDialog({
  isOpen,
  onClose,
  onAccept,
  oldPrompt,
  initialNewPrompt,
}: PromptDiffPreviewDialogProps) {
  const form = useAppForm({
    validators: {
      onChange: PromptFormSchema,
      onMount: PromptFormSchema,
    },
    defaultValues: {
      editablePrompt: initialNewPrompt,
    },
    onSubmit: async ({ value }) => {
      onAccept(value.editablePrompt);
      onClose();
    },
  });

  const editablePrompt = useStore(
    form.store,
    (state) => state.values.editablePrompt
  );
  const isValid = useStore(form.store, (state) => state.isValid);

  // Live diff calculation - updates as user types
  const liveDiff = useMemo(() => {
    return diffWordsWithSpace(oldPrompt, editablePrompt);
  }, [oldPrompt, editablePrompt]);

  const renderDiff = useCallback(
    (diff: ReturnType<typeof diffWordsWithSpace>) => {
      return (
        <div className="font-mono text-sm whitespace-pre-wrap max-h-80 overflow-y-auto border rounded-md p-4 bg-muted/30">
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
    },
    []
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      e.stopPropagation();
      form.handleSubmit();
    },
    [form]
  );

  const hasUserModifications = editablePrompt !== initialNewPrompt;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Edit Prompt with Live Preview</DialogTitle>
          <DialogDescription>
            Edit your custom prompt and see the changes in real-time. Green text
            shows additions, red text shows deletions.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col space-y-4">
          {/* Top Section - Live Diff Preview */}
          <div className="flex-1 flex flex-col min-h-0">
            <h4 className="text-sm font-medium mb-2">
              Live Changes Preview{" "}
              {hasUserModifications && (
                <span className="text-amber-600 dark:text-amber-400">
                  (Modified)
                </span>
              )}
            </h4>
            <div className="text-xs text-muted-foreground mb-2">
              Changes from your original prompt
            </div>
            <div className="flex-1 min-h-0">{renderDiff(liveDiff)}</div>
          </div>

          {/* Bottom Section - Editable Form */}
          <div className="flex-1 flex flex-col min-h-0">
            <form.AppForm>
              <form onSubmit={handleSubmit} className="flex flex-col h-full">
                <form.AppField
                  name="editablePrompt"
                  children={(field) => (
                    <field.FormItem className="flex-1 flex flex-col min-h-0">
                      <field.FormLabel className="text-sm font-medium mb-2">
                        Edit Prompt:
                      </field.FormLabel>
                      <field.FormControl className="flex-1 min-h-0">
                        <Textarea
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          onBlur={field.handleBlur}
                          className="flex-1 min-h-[200px] font-mono text-sm resize-none"
                          placeholder="Edit your custom prompt here..."
                        />
                      </field.FormControl>
                      <field.FormMessage />
                    </field.FormItem>
                  )}
                />
              </form>
            </form.AppForm>
          </div>
        </div>

        <div className="flex justify-between items-center pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            {hasUserModifications && (
              <span className="text-amber-600 dark:text-amber-400">
                ⚠ You've made changes to the AI suggestion
              </span>
            )}
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!isValid || !editablePrompt.trim()}
            >
              Accept Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
