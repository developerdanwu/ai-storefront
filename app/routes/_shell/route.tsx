import { useConvexAction } from "@convex-dev/react-query";
import { Slottable } from "@radix-ui/react-slot";
import { useMutation } from "@tanstack/react-query";
import { authkitLoader } from "@workos-inc/authkit-react-router";
import { api } from "convex/_generated/api";
import { Authenticated, Unauthenticated } from "convex/react";
import { LogInIcon, MessageSquare, MoonIcon, SunIcon } from "lucide-react";
import { Link, Outlet, useLoaderData, useParams } from "react-router";
import { AnonymousUser } from "~/components/auth/auth-provider";
import { useTheme } from "~/components/theme-provider";
import { AnonymousThreads } from "~/components/ui/anonymous-threads";
import { AuthenticatedThreads } from "~/components/ui/authenticated-threads";
import { Input } from "~/components/ui/input";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenuButton,
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
  const { setTheme, currentTheme, theme } = useTheme();
  console.log("THEMING", currentTheme, theme);
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
            <>
              <SidebarHeader>
                <Input />
              </SidebarHeader>
              <SidebarContent>
                <div className="p-4 text-center text-muted-foreground">
                  <MessageSquare
                    size={48}
                    className="mx-auto mb-2 opacity-50"
                  />
                  <p className="text-sm">No chats yet</p>
                  <p className="text-xs">Start a new conversation</p>
                </div>
              </SidebarContent>
            </>
          }
        >
          <AnonymousThreads activeThreadId={threadId} />
        </AnonymousUser>
        <SidebarFooter>
          {currentTheme === "dark" && (
            <SidebarMenuButton onClick={() => setTheme("light")}>
              <SunIcon />
              Lights on
            </SidebarMenuButton>
          )}
          {currentTheme === "light" && (
            <SidebarMenuButton onClick={() => setTheme("dark")}>
              <MoonIcon />
              Lights off
            </SidebarMenuButton>
          )}
          <Authenticated>{user && <NavUser user={user} />}</Authenticated>
          <Unauthenticated>
            <SidebarMenuButton asChild>
              <LogInIcon />
              <Slottable>
                <Link to="/login">Sign In</Link>
              </Slottable>
            </SidebarMenuButton>
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
