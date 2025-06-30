import { toUIMessages, useThreadMessages } from "@convex-dev/agent/react";
import { useConvexAction, useConvexQuery } from "@convex-dev/react-query";
import { useMutation } from "@tanstack/react-query";
import { api } from "convex/_generated/api";
import { useCallback, useMemo } from "react";
import { useParams } from "react-router";
import { z } from "zod";
import { MessageInputField } from "~/components/ui/message-input-field";

const MessageSchema = z.object({
  message: z.string().min(1, {
    message: "Message cannot be empty.",
  }),
});

export default function ChatThreadRoute() {
  const { threadId } = useParams();

  // Get messages for the current thread
  const messages = useThreadMessages(
    api.ai.getMessages,
    {
      threadId: threadId!,
    },
    {
      initialNumItems: 20,
      stream: true,
    }
  );

  const uiMessages = useMemo(() => {
    return toUIMessages(messages.results).map((x) => {
      const originalMessage = messages.results.find((y) => y._id === x.id);
      return {
        ...x,
        originalMessage,
      };
    });
  }, [messages.results]);

  // Get threads to find the current thread's title
  const threadsResult = useConvexQuery(api.ai.getThreads, {
    paginationOpts: { numItems: 50, cursor: null },
  });

  const threads = threadsResult?.page || [];
  const messagesLoading = messages.status === "LoadingFirstPage";
  const currentThread = threads.find((t) => t._id === threadId);

  // Send message
  const sendMessage = useMutation({
    mutationFn: useConvexAction(api.ai.sendMessage),
    onSuccess: () => {
      // The query will automatically refetch due to reactivity
    },
  });

  // Handle message submission
  const handleMessageSubmit = useCallback(
    async (message: string) => {
      if (threadId) {
        console.log("Sending message", message);
        sendMessage.mutate({
          threadId: threadId as any, // Type assertion for now
          prompt: message,
        });
      }
    },
    [threadId, sendMessage]
  );

  if (!threadId) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <p>Thread not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 h-full flex flex-col">
      {/* Chat Header */}
      <div className="p-4 border-b border-border">
        <h2 className="font-semibold">{currentThread?.title || "Chat"}</h2>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messagesLoading && (
          <div className="text-center text-muted-foreground">
            <p className="text-sm">Loading messages...</p>
          </div>
        )}

        {uiMessages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[70%] rounded-lg p-3 ${
                message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
              }`}
            >
              <div className="text-sm whitespace-pre-wrap">
                {typeof message.content === "string"
                  ? message.content
                  : Array.isArray(message.content)
                    ? message.content
                        .filter((item) => item.type === "text")
                        .map((item) => item.text)
                        .join("")
                    : "Message content unavailable"}
              </div>
              <p className="text-xs opacity-70 mt-2">
                {new Date(message.createdAt!).toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
      </div>
      <div className="p-4 border-t border-border">
        <MessageInputField
          name="message"
          placeholder="Type your message..."
          onSubmit={handleMessageSubmit}
          schema={MessageSchema.shape.message}
          isSubmitting={sendMessage.isPending}
          rows={1}
        />
      </div>
    </div>
  );
}
