import { useConvexAction } from "@convex-dev/react-query";
import { useMutation } from "@tanstack/react-query";
import { api } from "convex/_generated/api";
import { Camera, Github, Upload } from "lucide-react";
import * as React from "react";
import { useCallback } from "react";
import type { MetaFunction } from "react-router";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import { MessageInputField } from "~/components/ui/message-input-field";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

const FormSchema = z.object({
  message: z.string().min(1, {
    message: "Message cannot be empty.",
  }),
});

export default function Index() {
  const [suggestionValue, setSuggestionValue] = React.useState<
    string | undefined
  >();
  const createThread = useMutation({
    mutationFn: useConvexAction(api.ai.createThread),
    onSuccess: (x) => {},
  });

  const handleMessageSubmit = useCallback(
    async (message: string) => {
      console.log("Form submitted with:", message);
      // signIn("anonymous");
      createThread.mutate({
        prompt: message,
      });
      // TODO: Add actual submit logic here
    },
    [createThread]
  );

  const handleSuggestionClick = (suggestion: string) => {
    console.log("Suggestion clicked:", suggestion);
    setSuggestionValue(suggestion);
  };

  const handleExternalValueChange = useCallback(() => {
    setSuggestionValue(undefined);
  }, []);

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
        <MessageInputField
          name="message"
          placeholder="Ask me anything..."
          onSubmit={handleMessageSubmit}
          schema={FormSchema.shape.message}
          isSubmitting={createThread.isPending}
          externalValue={suggestionValue}
          onExternalValueChange={handleExternalValueChange}
        />
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
