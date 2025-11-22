import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./shared/providers/query-client";
import { LoadingScreen } from "@/shared/ui/loading-screen";

export const router = createRouter({
	routeTree,
	defaultPreload: "intent",
	defaultPendingComponent: () => <LoadingScreen message="Loading..." />,
	Wrap: ({ children }: { children: React.ReactNode }) => (
		<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
	),
});

declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}
