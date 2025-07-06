import { lazy } from "react";

export const LazyAuthenticatedChatThread = lazy(() =>
  import(
    "~/routes/_shell.chat.$threadId/_components/authenticated-chat-thread"
  ).then((module) => ({
    default: module.AuthenticatedChatThread,
  }))
);

export const LazyAnonymousChatThread = lazy(() =>
  import(
    "~/routes/_shell.chat.$threadId/_components/anonymous-chat-thread"
  ).then((module) => ({
    default: module.AnonymousChatThread,
  }))
);
