import { Authenticated } from "convex/react";
import type { MetaFunction } from "react-router";
import { AnonymousUser } from "~/components/auth/auth-provider";
import { AnonymousChatThread } from "./_components/anonymous-chat-thread";
import { AuthenticatedChatThread } from "./_components/authenticated-chat-thread";

export const meta: MetaFunction = () => {
  return [
    { title: "Dan Wu's personal website | Chat" },
    {
      name: "description",
      content:
        "This is Dan Wu's personal website and where he shares his thoughts and projects.",
    },
  ];
};

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
