import { supabase } from "@/shared/utils/supabase";
import { useRouter } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import { Trash2, AlertTriangle, ArrowLeft } from "lucide-react";
import { AppHeader } from "@/shared/components/app-header";
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
			alert("Your account data has been deleted. Please contact support to fully remove your account from the authentication system.");
			
			router.navigate({ to: "/login" });
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
						Back to Dashboard
					</Button>
					<h1 className="text-3xl font-bold tracking-tight">Settings</h1>
					<p className="text-muted-foreground mt-1">
						Manage your account settings and preferences
					</p>
				</div>

				{/* Account Information */}
				<Card className="p-6 space-y-6">
					<div>
						<h2 className="text-xl font-semibold mb-4">Account Information</h2>
						<div className="space-y-2">
							<div className="flex justify-between items-center py-2">
								<span className="text-sm text-muted-foreground">Email</span>
								<span className="text-sm font-medium">{userEmail}</span>
							</div>
						</div>
					</div>
				</Card>

				{/* Danger Zone */}
				<Card className="p-6 border-destructive/50">
					<h2 className="text-xl font-semibold mb-2 text-destructive flex items-center gap-2">
						<AlertTriangle className="h-5 w-5" />
						Danger Zone
					</h2>
					<p className="text-sm text-muted-foreground mb-4">
						Once you delete your account, there is no going back. This will permanently delete all your health records, family connections, and personal data.
					</p>
					<Button
						variant="destructive"
						onClick={() => setShowDeleteDialog(true)}
						className="w-full sm:w-auto"
					>
						<Trash2 className="h-4 w-4 mr-2" />
						Delete Account
					</Button>
				</Card>
			</main>

			{/* Delete Confirmation Dialog */}
			<Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2 text-destructive">
							<AlertTriangle className="h-5 w-5" />
							Delete Account
						</DialogTitle>
						<DialogDescription className="space-y-4">
							<p>
								This action <strong>cannot be undone</strong>. This will permanently delete:
							</p>
							<ul className="list-disc list-inside space-y-1 text-sm">
								<li>Your patient profile and personal information</li>
								<li>All health records and medical documents</li>
								<li>Family connections and shared data</li>
								<li>AI analyses and health suggestions</li>
							</ul>
							<p className="font-semibold">
								Type <span className="text-destructive">DELETE</span> to confirm:
							</p>
							<input
								type="text"
								value={confirmText}
								onChange={(e) => setConfirmText(e.target.value)}
								placeholder="Type DELETE"
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
							Cancel
						</Button>
						<Button
							variant="destructive"
							onClick={handleDeleteAccount}
							disabled={confirmText !== "DELETE" || loading}
						>
							{loading ? "Deleting..." : "Delete My Account"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
