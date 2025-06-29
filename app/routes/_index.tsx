import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAction } from "@convex-dev/react-query";
import type { MetaFunction } from "@remix-run/node";
import { useMutation } from "@tanstack/react-query";
import { api } from "convex/_generated/api";
import { Camera, Github, Upload } from "lucide-react";
import { useCallback } from "react";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import { useAppForm } from "~/components/ui/tanstack-form";
import { Textarea } from "~/components/ui/textarea";

export const meta: MetaFunction = () => {
  return [{ title: "New Remix App" }, { name: "description", content: "Welcome to Remix!" }];
};

const FormSchema = z.object({
  message: z.string().min(1, {
    message: "Message cannot be empty.",
  }),
});

export default function Index() {
  const { signIn, signOut } = useAuthActions();
  const createThread = useMutation({
    mutationFn: useConvexAction(api.ai.createThread),
  });
  const form = useAppForm({
    validators: { onChange: FormSchema },
    defaultValues: {
      message: "",
    },
    onSubmit: async ({ value }) => {
      console.log("Form submitted with:", value.message);
      // signIn("anonymous");
      createThread.mutate({
        prompt: value.message,
      });
      form.reset();
      // TODO: Add actual submit logic here
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

  const handleSuggestionClick = (suggestion: string) => {
    console.log("Suggestion clicked:", suggestion);
    form.setFieldValue("message", suggestion);
  };

  const suggestions = [
    {
      icon: <Camera size={16} />,
      text: "Buy something",
    },
    {
      icon: <Github size={16} />,
      text: "About me",
    },
    {
      icon: <Upload size={16} />,
      text: "Projects",
    },
  ];

  return (
    <div className="flex flex-col items-center justify-center h-screen p-4">
      <div className="w-full max-w-2xl space-y-6">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-8">
            How can I help you?
          </h1>
        </div>
        <form.AppForm>
          <form onSubmit={handleSubmit}>
            <form.AppField
              name="message"
              children={(field) => (
                <field.FormItem>
                  <div className="flex flex-col items-end border border-input rounded-md bg-transparent shadow-xs focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50 transition-[color,box-shadow]">
                    <field.FormControl>
                      <Textarea
                        variant="ghost"
                        placeholder="Ask me anything..."
                        className="resize-none flex-1 border-none shadow-none focus-visible:ring-0"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSubmit(e);
                          }
                        }}
                      />
                    </field.FormControl>
                    <Button
                      type="submit"
                      size="sm"
                      className="m-3"
                      disabled={!field.state.value.trim() || form.state.isSubmitting}
                    >
                      Send
                    </Button>
                  </div>
                </field.FormItem>
              )}
            />
          </form>
        </form.AppForm>
        <div className="flex flex-wrap justify-center gap-2">
          {suggestions.map((suggestion, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => handleSuggestionClick(suggestion.text)}
            >
              {suggestion.icon}
              {suggestion.text}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
