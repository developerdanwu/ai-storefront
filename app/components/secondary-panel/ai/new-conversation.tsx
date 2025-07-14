import { Bot } from "lucide-react";
import { AiConversationEditor } from "./conversation-editor";

export function NewConversation() {
  return (
    <div className="flex h-full flex-col items-center justify-center">
      <div className="w-full">
        <div className="flex flex-col items-center justify-center  p-6 space-y-6">
          <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center">
            <Bot size={40} className="text-muted-foreground" />
          </div>

          <div className="text-center space-y-2">
            <h2 className="text-xl font-semibold">
              What do you want to know today?
            </h2>
            <p className="text-muted-foreground">
              I'm your AI assistant, here to help you build a successful
              product.
            </p>
          </div>
          <div className="w-full max-w-md space-y-4">
            <AiConversationEditor />
          </div>
        </div>
      </div>
    </div>
  );
}
