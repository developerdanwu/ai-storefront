import type { ToolInvocationUIPart } from "@ai-sdk/ui-utils";
import type { MessageDoc } from "@convex-dev/agent";
import type { MessageStatus } from "@convex-dev/agent/validators";
import type { UIMessage as AIUIMessage, ToolCallPart } from "ai";
import {
  deserializeMessage,
  toUIFilePart,
} from "node_modules/@convex-dev/agent/dist/mapping";

export type UIMessage = AIUIMessage & {
  key: string;
  order: number;
  stepOrder: number;
  status: "streaming" | MessageStatus;
};

export function toUIMessages(
  messages: (MessageDoc & { streaming?: boolean })[],
  {
    onToolCall,
  }: {
    onToolCall: (args: {
      toolInvocationPart: ToolCallPart;
      messageId: string;
    }) => any;
  }
): UIMessage[] {
  const uiMessages: UIMessage[] = [];
  let assistantMessage: UIMessage | undefined;
  for (const message of messages) {
    const coreMessage = message.message && deserializeMessage(message.message);
    const text = message.text ?? "";
    const content = coreMessage?.content;
    const nonStringContent =
      content && typeof content !== "string" ? content : [];
    if (!coreMessage) continue;
    const common = {
      id: message.id ?? message._id,
      createdAt: new Date(message._creationTime),
      order: message.order,
      stepOrder: message.stepOrder,
      status: message.streaming ? ("streaming" as const) : message.status,
      key: `${message.threadId}-${message.order}-${message.stepOrder}`,
    };
    if (coreMessage.role === "system") {
      uiMessages.push({
        ...common,
        role: "system",
        content: text,
        parts: [{ type: "text", text }],
      });
    } else if (coreMessage.role === "user") {
      const parts: UIMessage["parts"] = [];
      if (text) {
        parts.push({ type: "text", text });
      }
      nonStringContent.forEach((contentPart) => {
        switch (contentPart.type) {
          case "file":
          case "image":
            parts.push(toUIFilePart(contentPart));
            break;
        }
      });
      uiMessages.push({
        ...common,
        role: "user",
        content: message.text ?? "",
        parts,
      });
    } else {
      if (coreMessage.role === "tool" && !assistantMessage) {
        console.warn(
          "Tool message without preceding assistant message.. skipping",
          message
        );
        continue;
      }
      if (!assistantMessage) {
        assistantMessage = {
          ...common,
          role: "assistant",
          content: "",
          parts: [],
        };
        uiMessages.push(assistantMessage);
      } else {
        assistantMessage.status = message.streaming
          ? "streaming"
          : message.status;
      }
      // update it to the last message's id
      assistantMessage.id = message.id ?? message._id;
      if (message.reasoning) {
        assistantMessage.parts.push({
          type: "reasoning",
          reasoning: message.reasoning,
          details: message.reasoningDetails ?? [],
        });
      }
      if (message.text) {
        assistantMessage.parts.push({
          type: "text",
          text: message.text,
        });
        assistantMessage.content += message.text;
      }

      for (const source of message.sources ?? []) {
        assistantMessage.parts.push({
          type: "source",
          source,
        });
      }

      for (const contentPart of nonStringContent) {
        switch (contentPart.type) {
          case "file":
          case "image":
            assistantMessage.parts.push(toUIFilePart(contentPart));
            break;
          case "tool-call":
            assistantMessage.parts.push({
              type: "step-start",
            });
            assistantMessage.parts.push({
              type: "tool-invocation",
              toolInvocation: {
                state: "call",
                step: assistantMessage.parts.filter(
                  (part) => part.type === "tool-invocation"
                ).length,
                toolCallId: contentPart.toolCallId,
                toolName: contentPart.toolName,
                args: contentPart.args,
              },
            });
            const lastMessage = messages[messages.length - 1];
            if (
              lastMessage?.message?.content &&
              Array.isArray(lastMessage.message.content)
            ) {
              const lastMessageToolCall = lastMessage.message.content.find(
                (part) => part.type === "tool-call"
              );
              if (lastMessageToolCall) {
                const messageId = lastMessage.id ?? lastMessage._id;
                console.log("messageId", lastMessage);
                if (
                  !messageId.includes("-") &&
                  !message.streaming &&
                  message.status === "success"
                ) {
                  onToolCall({
                    toolInvocationPart: lastMessageToolCall,
                    messageId: lastMessage._id,
                  });
                }
              }
            }
            break;
          case "tool-result": {
            console.log("tool resulttttt", assistantMessage.parts);
            const call = assistantMessage.parts.find(
              (part) =>
                part.type === "tool-invocation" &&
                part.toolInvocation.toolCallId === contentPart.toolCallId
            ) as ToolInvocationUIPart | undefined;
            const toolInvocation: ToolInvocationUIPart["toolInvocation"] = {
              state: "result",
              toolCallId: contentPart.toolCallId,
              toolName: contentPart.toolName,
              args: call?.toolInvocation.args,
              result: contentPart.result,
              step:
                call?.toolInvocation.step ??
                assistantMessage.parts.filter(
                  (part) => part.type === "tool-invocation"
                ).length,
            };
            if (call) {
              (call as ToolInvocationUIPart).toolInvocation = toolInvocation;
            } else {
              console.warn(
                "Tool result without preceding tool call.. adding anyways",
                contentPart
              );
              assistantMessage.parts.push({
                type: "tool-invocation",
                toolInvocation,
              });
            }
            break;
          }
        }
      }
    }
    if (
      !message.tool &&
      assistantMessage &&
      assistantMessage.parts.length > 0
    ) {
      // Reset it so the next set of tool calls will create a new assistant message
      assistantMessage = undefined;
    }
  }
  return uiMessages;
}
