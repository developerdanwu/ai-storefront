import { useConvexAction } from "@convex-dev/react-query";
import { useMutation } from "@tanstack/react-query";
import { authkitLoader } from "@workos-inc/authkit-react-router";
import { api } from "convex/_generated/api";
import { Form, Outlet, useLoaderData, useParams } from "react-router";
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
import type { Route } from "./+types/route";

export const loader = async (args: Route.LoaderArgs) => authkitLoader(args);

export default function ShellRoute() {
  const { user } = useLoaderData<typeof loader>();
  const { threadId } = useParams();

  // Create new thread
  const createThread = useMutation({
    mutationFn: useConvexAction(api.ai.action.createThread),
  });

  return (
    <SidebarProvider>
      <Sidebar>
        {user ? <AuthenticatedThreads activeThreadId={threadId} /> : null}
        {!user ? <AnonymousThreads activeThreadId={threadId} /> : null}
        <SidebarFooter>
          {user ? (
            <Form action="/logout" method="post">
              <Button
                variant="outline"
                size="sm"
                type="submit"
                className="w-full"
              >
                Sign Out
              </Button>
            </Form>
          ) : (
            <Button>Logged in</Button>
          )}
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <Outlet context={{ createThread }} />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
