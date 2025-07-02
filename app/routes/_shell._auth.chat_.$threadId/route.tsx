import { Authenticated, Unauthenticated } from "convex/react";
import { AnonymousChatThread } from "./_components/anonymous-chat-thread";
import { AuthenticatedChatThread } from "./_components/authenticated-chat-thread";

export default function ChatThreadRoute() {
  return (
    <>
      <Authenticated>
        <AuthenticatedChatThread />
      </Authenticated>
      <Unauthenticated>
        <AnonymousChatThread />
      </Unauthenticated>
    </>
  );
}
