import { useConvexAction } from "@convex-dev/react-query";
import { useMutation } from "@tanstack/react-query";
import { authkitLoader } from "@workos-inc/authkit-react-router";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { Camera, Github, Upload } from "lucide-react";
import * as React from "react";
import { useCallback } from "react";
import {
  generatePath,
  type MetaFunction,
  useLoaderData,
  useNavigate,
} from "react-router";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import { MessageInputField } from "~/components/ui/message-input-field";
import { useAnonymousUserId } from "~/lib/hooks/useAnonymousUserId";
import { ROUTES } from "~/lib/routes";
import type { Route } from "./+types/_shell._index";

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

export const loader = async (args: Route.LoaderArgs) => authkitLoader(args);

export default function Index() {
  const { user } = useLoaderData<typeof loader>();
  const [suggestionValue, setSuggestionValue] = React.useState<
    string | undefined
  >();
  const navigate = useNavigate();
  const [anonymousUserId, setAnonymousUserId] = useAnonymousUserId();
  const createAnonymousThread = useMutation({
    mutationFn: useConvexAction(api.ai.action.createAnonymousThread),
    onSuccess: async (x: { userId: Id<"users">; threadId: string }) => {
      setAnonymousUserId(x.userId);
      await navigate(generatePath(ROUTES.chatThread, { threadId: x.threadId }));
    },
    onError: (error) => {
      toast.error("Failed to create thread");
      console.error(error);
    },
  });

  const createAuthenticatedThread = useMutation({
    mutationFn: useConvexAction(api.ai.action.createThread),
    onSuccess: async (x: { threadId: string }) => {
      await navigate(generatePath(ROUTES.chatThread, { threadId: x.threadId }));
    },
    onError: (error) => {
      toast.error("Failed to create thread");
      console.error(error);
    },
  });

  const handleMessageSubmit = useCallback(
    async (message: string) => {
      if (user) {
        await createAuthenticatedThread.mutateAsync({
          prompt: message,
        });
      } else {
        await createAnonymousThread.mutateAsync({
          prompt: message,
          anonymousUserId: anonymousUserId,
        });
      }
    },
    [createAnonymousThread, anonymousUserId, createAuthenticatedThread, user]
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
    <div className="h-full flex flex-col">
      {/* Main content area */}
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-2xl space-y-6 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-8">
            How can I help you?
          </h1>

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
      <MessageInputField
        name="message"
        placeholder="Ask me anything..."
        onSubmit={handleMessageSubmit}
        schema={FormSchema.shape.message}
        isSubmitting={createAnonymousThread.isPending}
        externalValue={suggestionValue}
        onExternalValueChange={handleExternalValueChange}
      />
    </div>
  );
}
