import { MessageSquare } from "lucide-react";
import { useCallback } from "react";
import { useOutletContext } from "react-router";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import { useAppForm } from "~/components/ui/tanstack-form";
import { Textarea } from "~/components/ui/textarea";

const MessageSchema = z.object({
  message: z.string().min(1, {
    message: "Message cannot be empty.",
  }),
});

interface OutletContext {
  createThread: {
    mutate: (data: { prompt: string }) => void;
    isPending: boolean;
  };
}

export default function ChatWelcomeRoute() {
  const { createThread } = useOutletContext<OutletContext>();

  // Send message form
  const form = useAppForm({
    validators: { onChange: MessageSchema },
    defaultValues: {
      message: "",
    },
    onSubmit: async ({ value }) => {
      // Create new thread
      createThread.mutate({
        prompt: value.message,
      });
      form.reset();
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

  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center">
        <MessageSquare size={64} className="mx-auto mb-4 text-muted-foreground" />
        <h2 className="text-2xl font-semibold mb-2">Welcome to Chat</h2>
        <p className="text-muted-foreground mb-6">
          Select a chat from the sidebar or start a new conversation
        </p>
        <form.AppForm>
          <form onSubmit={handleSubmit} className="max-w-md">
            <form.AppField
              name="message"
              children={(field) => (
                <field.FormItem>
                  <div className="flex flex-col gap-2">
                    <field.FormControl>
                      <Textarea
                        placeholder="Start a new conversation..."
                        className="resize-none"
                        rows={3}
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                      />
                    </field.FormControl>
                    <Button
                      type="submit"
                      disabled={
                        !field.state.value.trim() ||
                        form.state.isSubmitting ||
                        createThread.isPending
                      }
                      className="w-full"
                    >
                      Start Chat
                    </Button>
                  </div>
                  <field.FormMessage />
                </field.FormItem>
              )}
            />
          </form>
        </form.AppForm>
      </div>
    </div>
  );
}
