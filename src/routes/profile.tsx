import { createFileRoute, redirect } from "@tanstack/react-router";
import Profile from "@/pages/profile";
import { queryClient } from "@/shared/providers/query-client";

export const Route = createFileRoute("/profile")({
	beforeLoad: async ({ context }) => {
		if (!context.userId) {
			throw new Error("User ID not available");
		}

		// Check cached profile data first (fast, no network call)
		const cachedProfile = queryClient.getQueryData(["profile", context.userId]);

		if (
			cachedProfile &&
			typeof cachedProfile === "object" &&
			"is_complete" in cachedProfile
		) {
			// Profile exists in cache and is not complete
			if (!cachedProfile.is_complete) {
				throw redirect({ to: "/complete-profile" });
			}
		}
		// If no cache, let the page component handle loading and redirect if needed
	},
	component: Profile,
});
