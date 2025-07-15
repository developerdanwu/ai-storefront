import { Authenticated } from "convex/react";
import { lazy, Suspense } from "react";
import { AnonymousUser } from "~/components/auth/auth-provider";
import { ChatThreadSkeleton } from "~/routes/_shell.chat.$threadId/_components/chat-thread-skeleton";

const LazyAuthenticatedChatThread = lazy(() =>
  import(
    "~/routes/_shell.chat.$threadId/_components/authenticated-chat-thread"
  ).then((module) => ({
    default: module.AuthenticatedChatThread,
  }))
);

const LazyAnonymousChatThread = lazy(() =>
  import(
    "~/routes/_shell.chat.$threadId/_components/anonymous-chat-thread"
  ).then((module) => ({
    default: module.AnonymousChatThread,
  }))
);

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
