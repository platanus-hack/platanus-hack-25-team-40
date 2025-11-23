import { Button } from "@/shared/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/shared/ui/card";

import { Plus, Upload, UserCircle, Activity } from "lucide-react";
import { UploadHealthRecordDialog } from "@/modules/health-records/components/upload-health-record-dialog";
import { FamilyMembersDialog } from "@/modules/family-members/components/family-members-dialog";
import { TimelineView } from "@/modules/health-records/components/timeline-view";
import { SuggestionsSection } from "@/modules/suggestions/components/suggestions-section";
import { useState } from "react";
import { useRouter } from "@tanstack/react-router";
import { AppHeader } from "@/shared/components/app-header";
import { useTranslation } from "react-i18next";

export default function Dashboard() {
	const router = useRouter();
	const { t } = useTranslation(["dashboard", "common", "healthRecords"]);
	const [isFamilyDialogOpen, setIsFamilyDialogOpen] = useState(false);
	const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);

	return (
		<div className="min-h-screen bg-background">
			<AppHeader />

			{/* Main Content */}
			<main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
				{/* Welcome Section */}
				<div className="mb-6 sm:mb-8">
					<h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
						{t("welcome")}
					</h1>
					<p className="text-sm sm:text-base text-muted-foreground">
						{t("description")}
					</p>
				</div>
				{/* Quick Actions */}
				<div className="grid gap-6 sm:grid-cols-2 mb-6 sm:mb-8">
					<Card
						className="cursor-pointer hover:border-primary transition-colors"
						onClick={() => router.navigate({ to: "/profile" })}
					>
						<CardHeader>
							<div className="flex items-center justify-between">
								<UserCircle className="h-8 w-8 text-primary" />
							</div>
							<CardTitle className="mt-4">
								{t("cards.myProfile.title")}
							</CardTitle>
							<CardDescription>
								{t("cards.myProfile.description")}
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								<Button variant="outline" className="w-full">
									{t("cards.myProfile.button")}
								</Button>
							</div>
						</CardContent>
					</Card>
					<Card className="cursor-pointer hover:border-primary transition-colors flex flex-col">
						<CardHeader className="flex-1">
							<div className="flex items-center justify-between">
								<Upload className="h-8 w-8 text-primary" />
							</div>
							<CardTitle className="mt-4">
								{t("cards.uploadRecords.title")}
							</CardTitle>
							<CardDescription>
								{t("cards.uploadRecords.description")}
							</CardDescription>
						</CardHeader>
						<CardContent>
							<Button
								className="w-full gap-2"
								onClick={() => setIsUploadDialogOpen(true)}
							>
								<Plus className="h-4 w-4" />
								{t("cards.uploadRecords.button")}
							</Button>
						</CardContent>
					</Card>
				</div>

				{/* Health Timeline and Oregon Insights */}
				<div className="grid gap-6 lg:grid-cols-2 mb-6 sm:mb-8">
					{/* Health Timeline */}
					<Card className="flex flex-col min-h-[400px] lg:h-full w-full max-w-2xl mx-auto lg:max-w-full lg:mx-0">
						<CardHeader className="pb-4 px-4 sm:px-6">
							<CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
								<Activity className="h-5 w-5" />
								{t("healthRecords:timeline.title")}
							</CardTitle>
							<CardDescription className="text-sm">
								{t("healthRecords:timeline.description")}
							</CardDescription>
						</CardHeader>
						<CardContent className="flex-1 min-h-0 pb-6 px-4 sm:px-6">
							<TimelineView />
						</CardContent>
					</Card>

					{/* Oregon Insights */}
					<div className="min-h-[400px] w-full max-w-2xl mx-auto lg:max-w-full lg:mx-0">
						<SuggestionsSection />
					</div>
				</div>
			</main>

			{/* Family Members Dialog */}
			<FamilyMembersDialog
				open={isFamilyDialogOpen}
				onOpenChange={setIsFamilyDialogOpen}
			/>
			<UploadHealthRecordDialog
				open={isUploadDialogOpen}
				onOpenChange={setIsUploadDialogOpen}
			/>
		</div>
	);
}
