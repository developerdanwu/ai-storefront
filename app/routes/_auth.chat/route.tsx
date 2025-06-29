import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAction, useConvexQuery } from "@convex-dev/react-query";
import { useMutation } from "@tanstack/react-query";
import { api } from "convex/_generated/api";
import { MessageSquare, Plus, Send } from "lucide-react";
import { useCallback, useState } from "react";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import { useAppForm } from "~/components/ui/tanstack-form";
import { Textarea } from "~/components/ui/textarea";

const MessageSchema = z.object({
  message: z.string().min(1, {
    message: "Message cannot be empty.",
  }),
});

export default function ChatRoute() {
  const { signOut } = useAuthActions();
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);

  // Get threads from API
  const threadsResult = useConvexQuery(api.ai.getThreads, {
    paginationOpts: { numItems: 50, cursor: null },
  });

  // Get messages for selected thread
  const messagesResult = useConvexQuery(
    api.ai.getMessages,
    selectedThreadId
      ? {
          threadId: selectedThreadId as any, // Type assertion for now
          paginationOpts: { numItems: 50, cursor: null },
        }
      : "skip"
  );

  const threads = threadsResult?.page || [];
  const messages = messagesResult?.page || [];
  const threadsLoading = threadsResult === undefined;
  const messagesLoading = messagesResult === undefined;

  // Create new thread
  const createThread = useMutation({
    mutationFn: useConvexAction(api.ai.createThread),
    onSuccess: (result) => {
      if (result && typeof result === "object" && "threadId" in result) {
        setSelectedThreadId(result.threadId as string);
      }
    },
  });

  // Send message
  const sendMessage = useMutation({
    mutationFn: useConvexAction(api.ai.sendMessage),
    onSuccess: () => {
      // The query will automatically refetch due to reactivity
    },
  });

  // Send message form
  const form = useAppForm({
    validators: { onChange: MessageSchema },
    defaultValues: {
      message: "",
    },
    onSubmit: async ({ value }) => {
      if (!selectedThreadId) {
        // Create new thread if none selected
        createThread.mutate({
          prompt: value.message,
        });
      } else {
        // Send message to existing thread
        sendMessage.mutate({
          threadId: selectedThreadId as any, // Type assertion for now
          message: value.message,
        });
      }
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

  const handleNewChat = () => {
    setSelectedThreadId(null);
    form.reset();
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-80 border-r border-border flex flex-col">
        {/* Sidebar Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold">Chats</h1>
            <Button variant="ghost" size="sm" onClick={handleNewChat} className="gap-2">
              <Plus size={16} />
              New Chat
            </Button>
          </div>
        </div>

        {/* Threads List */}
        <div className="flex-1 overflow-y-auto">
          {threadsLoading && (
            <div className="p-4 text-center text-muted-foreground">
              <p className="text-sm">Loading chats...</p>
            </div>
          )}

          {threads.map((thread) => (
            <button
              key={thread._id}
              onClick={() => setSelectedThreadId(thread._id)}
              className={`w-full p-4 text-left hover:bg-muted/50 border-b border-border/50 transition-colors ${
                selectedThreadId === thread._id ? "bg-muted" : ""
              }`}
            >
              <div className="flex items-start gap-3">
                <MessageSquare size={16} className="mt-1 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{thread.title || "New Chat"}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(thread._creationTime).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </button>
          ))}

          {!threadsLoading && threads.length === 0 && (
            <div className="p-4 text-center text-muted-foreground">
              <MessageSquare size={48} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">No chats yet</p>
              <p className="text-xs">Start a new conversation</p>
            </div>
          )}
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-border">
          <Button variant="outline" size="sm" onClick={() => signOut()} className="w-full">
            Sign Out
          </Button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedThreadId ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-border">
              <h2 className="font-semibold">
                {threads.find((t) => t._id === selectedThreadId)?.title || "Chat"}
              </h2>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messagesLoading && (
                <div className="text-center text-muted-foreground">
                  <p className="text-sm">Loading messages...</p>
                </div>
              )}

              {messages.map((message) => (
                <div
                  key={message._id}
                  className={`flex ${
                    message.message?.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg p-3 ${
                      message.message?.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <div className="text-sm whitespace-pre-wrap">
                      {typeof message.message?.content === "string"
                        ? message.message.content
                        : Array.isArray(message.message?.content)
                          ? message.message.content
                              .filter((item) => item.type === "text")
                              .map((item) => item.text)
                              .join("")
                          : "Message content unavailable"}
                    </div>
                    <p className="text-xs opacity-70 mt-2">
                      {new Date(message._creationTime).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-border">
              <form.AppForm>
                <form onSubmit={handleSubmit}>
                  <form.AppField
                    name="message"
                    children={(field) => (
                      <field.FormItem>
                        <div className="flex gap-2">
                          <field.FormControl>
                            <Textarea
                              placeholder="Type your message..."
                              className="resize-none flex-1"
                              rows={1}
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
                            disabled={
                              !field.state.value.trim() ||
                              form.state.isSubmitting ||
                              sendMessage.isPending
                            }
                          >
                            <Send size={16} />
                          </Button>
                        </div>
                        <field.FormMessage />
                      </field.FormItem>
                    )}
                  />
                </form>
              </form.AppForm>
            </div>
          </>
        ) : (
          /* Welcome Screen */
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
        )}
      </div>
    </div>
  );
}
