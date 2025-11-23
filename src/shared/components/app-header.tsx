import { useUser, signOut } from "@/shared/hooks/useAuth";
import { Button } from "@/shared/ui/button";
import { LogOut, Settings } from "lucide-react";
import { useRouter } from "@tanstack/react-router";
import { useProfileQuery } from "@/modules/profile/hooks/use-profile-query";
import { useTranslation } from "react-i18next";

export function AppHeader() {
	const router = useRouter();
	const { t } = useTranslation("common");
	const user = useUser();
	const { data: profile } = useProfileQuery();

	const handleSignOut = async () => {
		try {
			await signOut();
			// Force a hard redirect to login page to ensure session is cleared
			window.location.href = "/login";
		} catch (error) {
			console.error("Sign out error:", error);
			// Navigate anyway in case of error
			window.location.href = "/login";
		}
	};

	const displayName = profile?.name || user?.email || "User";

	return (
		<header className="border-b bg-background sticky top-0 z-50">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="flex h-16 items-center justify-between">
					<div
						className="flex items-center cursor-pointer"
						onClick={() => router.navigate({ to: "/dashboard" })}
					>
						<img
							src="/oregon.svg"
							alt="Oregon Health"
							className="h-10 w-10 text-primary"
						/>
						<span className="text-xl font-bold">Oregon Health</span>
					</div>
					<div className="flex items-center gap-4">
						<button
							onClick={() => router.navigate({ to: "/profile" })}
							className="hidden sm:flex items-center gap-2 text-sm hover:text-foreground transition-colors cursor-pointer"
							title="View Profile"
						>
							<span className="text-muted-foreground">{displayName}</span>
						</button>
						<Button
							variant="ghost"
							size="icon"
							onClick={() => router.navigate({ to: "/settings" })}
							title="Settings"
						>
							<Settings className="h-4 w-4" />
						</Button>
						<Button
							variant="ghost"
							size="sm"
							onClick={handleSignOut}
							className="gap-2"
						>
							<LogOut className="h-4 w-4" />
							<span className="hidden sm:inline">{t("actions.signOut")}</span>
						</Button>
					</div>
				</div>
			</div>
		</header>
	);
}
