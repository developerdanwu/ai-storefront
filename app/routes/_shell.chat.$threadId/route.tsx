import { Authenticated } from "convex/react";
import { AnonymousUser } from "~/components/auth/auth-provider";
import { AnonymousChatThread } from "./_components/anonymous-chat-thread";
import { AuthenticatedChatThread } from "./_components/authenticated-chat-thread";

export default function ChatThreadRoute() {
  return (
    <>
      <Authenticated>
        <AuthenticatedChatThread />
      </Authenticated>
      <AnonymousUser>
        <AnonymousChatThread />
      </AnonymousUser>
    </>
  );
}
