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

const suggestions = [
  {
    icon: <Camera size={16} />,
    text: "Buy something",
    value: "buy-something",
    prompt: "I want to buy something",
  },
  {
    icon: <Github size={16} />,
    text: "About me",
    value: "about-me",
    prompt: "Tell me about yourself",
  },
  {
    icon: <Upload size={16} />,
    text: "Projects",
    value: "projects",
    prompt: "Tell me about your projects",
  },
] as const;

type SubmittingSource = "message-input" | (typeof suggestions)[number]["value"];

export const loader = async (args: Route.LoaderArgs) => authkitLoader(args);

export default function Index() {
  const { user } = useLoaderData<typeof loader>();

  const [submittingSource, setSubmittingSource] = React.useState<
    SubmittingSource | undefined
  >(undefined);
  const navigate = useNavigate();
  const [anonymousUserId, setAnonymousUserId] = useAnonymousUserId();
  const anonymousThreadAction = useConvexAction(
    api.ai.action.createAnonymousThread
  );
  const createAnonymousThread = useMutation({
    mutationFn: ({ prompt, anonymousUserId }) => {
      return anonymousThreadAction({
        prompt,
        anonymousUserId,
      });
    },
    onMutate: (x: {
      prompt: string;
      submittingSource: SubmittingSource;
      anonymousUserId: Id<"users"> | null;
    }) => {
      setSubmittingSource(x.submittingSource);
    },
    onSuccess: async (
      x: { userId: Id<"users">; threadId: string },
      { prompt }
    ) => {
      setAnonymousUserId(x.userId);
      await navigate(generatePath(ROUTES.chatThread, { threadId: x.threadId }));
      continueAnonymousThreadMutation.mutate({
        threadId: x.threadId,
        prompt,
        anonymousUserId: x.userId,
      });
    },
    onSettled: () => {
      setSubmittingSource(undefined);
    },
    onError: (error) => {
      toast.error("Failed to create thread");
      console.error(error);
    },
  });

  const authenticatedThreadAction = useConvexAction(api.ai.action.createThread);
  const createAuthenticatedThread = useMutation({
    mutationFn: ({ prompt }) => {
      return authenticatedThreadAction({
        prompt,
      });
    },
    onMutate: (x: { prompt: string; submittingSource: SubmittingSource }) => {
      setSubmittingSource(x.submittingSource);
    },
    onSuccess: async (x: { threadId: string }, { prompt }) => {
      await navigate(generatePath(ROUTES.chatThread, { threadId: x.threadId }));
      continueAuthenticatedThreadMutation.mutate({
        threadId: x.threadId,
        prompt,
      });
    },
    onSettled: () => {
      setSubmittingSource(undefined);
    },
    onError: (error) => {
      toast.error("Failed to create thread");
      console.error(error);
    },
  });

  const continueAnonymousThreadMutation = useMutation({
    mutationFn: useConvexAction(api.ai.action.continueAnonymousThread),
    onSuccess: () => {},
    onError: (error) => {
      toast.error("Failed to continue thread");
      console.error(error);
    },
  });

  const continueAuthenticatedThreadMutation = useMutation({
    mutationFn: useConvexAction(api.ai.action.continueThread),
    onSuccess: () => {},
    onError: (error) => {
      toast.error("Failed to continue thread");
      console.error(error);
    },
  });

  const disabled =
    createAnonymousThread.isPending || createAuthenticatedThread.isPending;

  const handleMessageSubmit = useCallback(
    async (
      message: string,
      {
        submittingSource,
      }: {
        submittingSource: SubmittingSource;
      }
    ) => {
      setSubmittingSource(submittingSource);
      if (user) {
        await createAuthenticatedThread.mutateAsync({
          prompt: message,
          submittingSource,
        });
      } else {
        await createAnonymousThread.mutateAsync({
          prompt: message,
          anonymousUserId: anonymousUserId,
          submittingSource,
        });
      }
    },
    [createAnonymousThread, anonymousUserId, createAuthenticatedThread, user]
  );

  const handleSuggestionClick = (
    prompt: string,
    {
      submittingSource,
    }: {
      submittingSource: SubmittingSource;
    }
  ) => {
    handleMessageSubmit(prompt, { submittingSource });
  };

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
                disabled={disabled}
                key={index}
                variant="outline"
                size="sm"
                loading={submittingSource === suggestion.value}
                className="gap-2"
                onClick={() =>
                  handleSuggestionClick(suggestion.prompt, {
                    submittingSource: suggestion.value,
                  })
                }
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
        className="w-full max-w-3xl mx-auto"
        placeholder="Type your message..."
        onSubmit={(value) => {
          handleMessageSubmit(value.message, {
            submittingSource: "message-input",
          });
        }}
        disabled={disabled}
        isSubmitting={submittingSource === "message-input"}
      />
    </div>
  );
}
