import { MessageCircle } from "lucide-react";

export function EmptyThreads() {
  return (
    <div className="text-center text-muted-foreground flex flex-col items-center gap-2">
      <MessageCircle />
      <p className="text-sm">No chats found</p>
    </div>
  );
}
