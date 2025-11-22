import { useAtomValue } from "jotai";
import { authLoadingStateAtom } from "../atoms/auth-atoms";
import { LoadingScreen } from "../ui/loading-screen";
import { useEffect } from "react";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const authLoadingState = useAtomValue(authLoadingStateAtom);

  useEffect(() => {
		// Redirect to login if not authenticated
		if (authLoadingState === "unauthenticated") {
			window.location.href = "/login";
		}
	}, [authLoadingState]);

	// Show loading while checking auth
	if (authLoadingState === "idle" || authLoadingState === "loading") {
		return <LoadingScreen message="Authenticating..." />;
	}

	// Redirect to login if not authenticated
	if (authLoadingState === "unauthenticated") {
		return null; // Will redirect via useEffect
	}

  // User is authenticated, render protected content
  return <>{children}</>;
}
