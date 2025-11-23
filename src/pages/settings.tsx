import { supabase } from "@/shared/utils/supabase";
import { useRouter } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import { Trash2, AlertTriangle, ArrowLeft } from "lucide-react";
import { AppHeader } from "@/shared/components/app-header";
import { LanguageSwitcher } from "@/shared/components/language-switcher";
import { useTranslation } from "react-i18next";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/shared/ui/dialog";

export default function Settings() {
	const router = useRouter();
	const { t } = useTranslation(["settings", "common"]);
	const [loading, setLoading] = useState(false);
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);
	const [confirmText, setConfirmText] = useState("");
	const [userEmail, setUserEmail] = useState("");

	useEffect(() => {
		supabase.auth.getSession().then(({ data: { session } }) => {
			if (session?.user?.email) {
				setUserEmail(session.user.email);
			}
		});
	}, []);

	const handleDeleteAccount = async () => {
		if (confirmText !== "DELETE") {
			return;
		}

		setLoading(true);

		try {
			const { data: { session } } = await supabase.auth.getSession();
			if (!session?.user) {
				throw new Error("No user session found");
			}

			// Delete user's data from patient_profiles
			const { error: profileError } = await supabase
				.from('patient_profiles')
				.delete()
				.eq('user_id', session.user.id);

			if (profileError) {
				console.error("Error deleting profile:", profileError);
			}

			// Delete user's health records
			const { error: recordsError } = await supabase
				.from('health_records')
				.delete()
				.eq('user_id', session.user.id);

			if (recordsError) {
				console.error("Error deleting health records:", recordsError);
			}

			// Delete family links where user is involved
			const { error: linksError } = await supabase
				.from('family_links')
				.delete()
				.or(`user_id.eq.${session.user.id},relative_user_id.eq.${session.user.id}`);

			if (linksError) {
				console.error("Error deleting family links:", linksError);
			}

			// Delete suggestions
			const { error: suggestionsError } = await supabase
				.from('suggestions')
				.delete()
				.eq('user_id', session.user.id);

			if (suggestionsError) {
				console.error("Error deleting suggestions:", suggestionsError);
			}

			// Sign out the user
			await supabase.auth.signOut();

			// Note: Supabase auth users cannot be deleted via client SDK
			// This would need to be done via a server-side function or manually by an admin
			alert(t("deleteDialog.successMessage"));
			
			// Force a hard redirect to login page
			window.location.href = "/login";
		} catch (err) {
			console.error("Unexpected error:", err);
			alert("An error occurred while deleting your account. Please try again.");
		} finally {
			setLoading(false);
			setShowDeleteDialog(false);
		}
	};

	return (
		<div className="min-h-screen bg-background">
			<AppHeader />
			
			<main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
				<div className="mb-8">
					<Button
						variant="ghost"
						size="sm"
						onClick={() => router.navigate({ to: "/dashboard" })}
						className="mb-4 gap-2"
					>
						<ArrowLeft className="h-4 w-4" />
						{t("common:navigation.backToDashboard")}
					</Button>
					<h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
					<p className="text-muted-foreground mt-1">
						{t("description")}
					</p>
				</div>

				{/* Account Information */}
				<Card className="p-6 space-y-6 mb-6">
					<div>
						<h2 className="text-xl font-semibold mb-4">{t("sections.accountInfo.title")}</h2>
						<div className="space-y-2">
							<div className="flex justify-between items-center py-2">
								<span className="text-sm text-muted-foreground">{t("sections.accountInfo.email")}</span>
								<span className="text-sm font-medium">{userEmail}</span>
							</div>
						</div>
					</div>
				</Card>

				{/* Language Settings */}
				<Card className="p-6 mb-6">
					<LanguageSwitcher />
				</Card>

				{/* Danger Zone */}
				<Card className="p-6 border-destructive/50">
					<h2 className="text-xl font-semibold mb-2 text-destructive flex items-center gap-2">
						<AlertTriangle className="h-5 w-5" />
						{t("sections.dangerZone.title")}
					</h2>
					<p className="text-sm text-muted-foreground mb-4">
						{t("sections.dangerZone.description")}
					</p>
					<Button
						variant="destructive"
						onClick={() => setShowDeleteDialog(true)}
						className="w-full sm:w-auto"
					>
						<Trash2 className="h-4 w-4 mr-2" />
						{t("sections.dangerZone.button")}
					</Button>
				</Card>
			</main>

			{/* Delete Confirmation Dialog */}
			<Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2 text-destructive">
							<AlertTriangle className="h-5 w-5" />
							{t("deleteDialog.title")}
						</DialogTitle>
						<DialogDescription className="space-y-4">
							<p>
								{t("deleteDialog.description")}
							</p>
							<ul className="list-disc list-inside space-y-1 text-sm">
								<li>{t("deleteDialog.items.0")}</li>
								<li>{t("deleteDialog.items.1")}</li>
								<li>{t("deleteDialog.items.2")}</li>
								<li>{t("deleteDialog.items.3")}</li>
							</ul>
							<p className="font-semibold">
								{t("deleteDialog.confirmPrompt")}
							</p>
							<input
								type="text"
								value={confirmText}
								onChange={(e) => setConfirmText(e.target.value)}
								placeholder={t("deleteDialog.confirmPlaceholder")}
								className="w-full rounded-lg border border-input bg-background px-4 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
							/>
						</DialogDescription>
					</DialogHeader>
					<DialogFooter className="gap-2">
						<Button
							variant="outline"
							onClick={() => {
								setShowDeleteDialog(false);
								setConfirmText("");
							}}
							disabled={loading}
						>
							{t("common:actions.cancel")}
						</Button>
						<Button
							variant="destructive"
							onClick={handleDeleteAccount}
							disabled={confirmText !== "DELETE" || loading}
						>
							{loading ? t("common:actions.deleting") : t("deleteDialog.deleteButton")}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
