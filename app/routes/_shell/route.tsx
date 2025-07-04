import { useConvexAction } from "@convex-dev/react-query";
import { useMutation } from "@tanstack/react-query";
import { authkitLoader } from "@workos-inc/authkit-react-router";
import { api } from "convex/_generated/api";
import { Authenticated, Unauthenticated } from "convex/react";
import { MessageSquare } from "lucide-react";
import { Link, Outlet, useLoaderData, useParams } from "react-router";
import { AnonymousUser } from "~/components/auth/auth-provider";
import { AnonymousThreads } from "~/components/ui/anonymous-threads";
import { AuthenticatedThreads } from "~/components/ui/authenticated-threads";
import { Button } from "~/components/ui/button";
import {
  Sidebar,
  SidebarFooter,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "~/components/ui/sidebar";
import { NavUser } from "~/routes/_shell/_components/nav-user";
import type { Route } from "./+types/route";

export const loader = async (args: Route.LoaderArgs) => authkitLoader(args);

export function useShellLoaderData() {
  return useLoaderData<typeof loader>();
}

export default function ShellRoute() {
  const { user } = useShellLoaderData();
  const { threadId } = useParams();

  // Create new thread
  const createThread = useMutation({
    mutationFn: useConvexAction(api.ai.action.createThread),
  });

  return (
    <SidebarProvider>
      <Sidebar>
        <Authenticated>
          <AuthenticatedThreads activeThreadId={threadId} />
        </Authenticated>
        <AnonymousUser
          fallback={
            <div className="p-4 text-center text-muted-foreground">
              <MessageSquare size={48} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">No chats yet</p>
              <p className="text-xs">Start a new conversation</p>
            </div>
          }
        >
          <AnonymousThreads activeThreadId={threadId} />
        </AnonymousUser>
        <SidebarFooter>
          <Authenticated>
            <NavUser user={user} />
          </Authenticated>
          <Unauthenticated>
            <Button asChild>
              <Link to="/login">Sign In</Link>
            </Button>
          </Unauthenticated>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0 overflow-hidden">
          <Outlet context={{ createThread }} />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
