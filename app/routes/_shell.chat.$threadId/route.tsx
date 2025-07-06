import { Authenticated } from "convex/react";
import { Suspense } from "react";
import type { MetaFunction } from "react-router";
import { AnonymousUser } from "~/components/auth/auth-provider";
import {
  LazyAnonymousChatThread,
  LazyAuthenticatedChatThread,
} from "~/lib/lazy-components";
import { ChatThreadSkeleton } from "~/routes/_shell.chat.$threadId/_components/chat-thread-skeleton";

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
        <Suspense fallback={<ChatThreadSkeleton />}>
          <LazyAuthenticatedChatThread />
        </Suspense>
      </Authenticated>
      <AnonymousUser>
        <Suspense fallback={<ChatThreadSkeleton />}>
          <LazyAnonymousChatThread />
        </Suspense>
      </AnonymousUser>
    </>
  );
}
