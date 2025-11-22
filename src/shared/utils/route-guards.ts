import { redirect } from "@tanstack/react-router";
import { supabase } from "./supabase";
import { ensureProfileExists } from "./profile-utils";

/**
 * Route guard that checks authentication and profile completion.
 * Redirects to /login if not authenticated.
 * Redirects to /complete-profile if profile is not complete.
 */
export async function requireAuthAndCompleteProfile() {
	const { data } = await supabase.auth.getSession();
	
	if (!data.session) {
		throw redirect({
			to: "/login",
		});
	}

	// Ensure profile exists and check if complete
	const isComplete = await ensureProfileExists(data.session.user.id);

	if (!isComplete) {
		throw redirect({
			to: "/complete-profile",
		});
	}

	return { userId: data.session.user.id };
}

/**
 * Route guard that only checks authentication (no profile check).
 * Use for routes like /complete-profile that need auth but not a complete profile.
 */
export async function requireAuth() {
	const { data } = await supabase.auth.getSession();
	
	if (!data.session) {
		throw redirect({
			to: "/login",
		});
	}

	return { userId: data.session.user.id };
}

/**
 * Lightweight guard that only checks profile completion.
 * Assumes authentication is already handled by root route.
 * Redirects to /complete-profile if profile is not complete.
 */
export async function requireCompleteProfile(userId: string) {
	// Check if profile is complete
	const isComplete = await ensureProfileExists(userId);

	if (!isComplete) {
		throw redirect({
			to: "/complete-profile",
		});
	}
}
