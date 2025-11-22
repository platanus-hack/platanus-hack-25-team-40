import { Outlet, createRootRoute, redirect } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { queryClient } from "@/shared/providers/query-client";
import { supabase } from "@/shared/utils/supabase";

// Public routes that don't require authentication
const PUBLIC_ROUTES = ["/", "/login"];

// Cache session for fast subsequent checks
let cachedSession: { userId: string; timestamp: number } | null = null;
const CACHE_DURATION = 5000; // 5 seconds cache

export const Route = createRootRoute({
  beforeLoad: async ({ location }) => {
		// Skip auth check for public routes
		if (PUBLIC_ROUTES.includes(location.pathname)) {
			return {};
		}

		// Return cached session if still valid
		const now = Date.now();
		if (cachedSession && now - cachedSession.timestamp < CACHE_DURATION) {
			return { userId: cachedSession.userId };
		}

		// Check authentication
		const { data } = await supabase.auth.getSession();

		if (!data.session) {
			cachedSession = null;
			throw redirect({
				to: "/login",
			});
		}

		// Cache the session
		cachedSession = {
			userId: data.session.user.id,
			timestamp: now,
		};

		return { userId: data.session.user.id };
	},
  component: RootComponent,
});

function RootComponent() {
  return (
    <>
      <Outlet />
      {import.meta.env.DEV && (
        <>
          <TanStackRouterDevtools />
          <ReactQueryDevtools client={queryClient} initialIsOpen={false} />
        </>
      )}
    </>
  );
}
