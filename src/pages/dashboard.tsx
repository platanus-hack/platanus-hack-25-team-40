import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";

import { FileText, Plus, Upload, UserCircle } from "lucide-react";
import { UploadHealthRecordDialog } from "@/modules/health-records/components/upload-health-record-dialog";
import { FamilyMembersDialog } from "@/modules/family-members/components/family-members-dialog";
import { TimelineSheet } from "@/modules/health-records/components/timeline-sheet";
import { SuggestionsSection } from "@/modules/suggestions/components/suggestions-section";
import { useState } from "react";
import { useRouter } from "@tanstack/react-router";
import { AppHeader } from "@/shared/components/app-header";
import { useProfileQuery } from "@/modules/profile/hooks/use-profile-query";

export default function Dashboard() {
	const router = useRouter();
	const [isFamilyDialogOpen, setIsFamilyDialogOpen] = useState(false);
	const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
	const [isTimelineOpen, setIsTimelineOpen] = useState(false);
	const { data: profile } = useProfileQuery();

	return (
		<div className="min-h-screen bg-background">
			<AppHeader />

			{/* Main Content */}
			<main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
				{/* Welcome Section */}
				<div className="mb-8">
					<h1 className="text-3xl font-bold tracking-tight mb-2">
						Welcome to Your Family Health Vault
					</h1>
					<p className="text-muted-foreground">
						Manage, organize, and understand your family's medical records in
						one secure place.
					</p>
				</div>
				{/* Quick Actions */}
				<div className="grid gap-4 md:grid-cols-3 mb-8">
					<Card
						className="cursor-pointer hover:border-primary transition-colors"
						onClick={() => router.navigate({ to: "/profile" })}
					>
						<CardHeader>
							<div className="flex items-center justify-between">
								<UserCircle className="h-8 w-8 text-primary" />
							</div>
							<CardTitle className="mt-4">My Profile</CardTitle>
							<CardDescription>
								View and manage your personal health information
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-2">
								{profile && (
									<div className="text-sm">
										<p className="font-medium">
											{profile.name} {profile.last_name}
										</p>
										{profile.blood_type && (
											<p className="text-muted-foreground">
												Blood Type: {profile.blood_type}
											</p>
										)}
									</div>
								)}
								<Button variant="outline" className="w-full">
									View Profile
								</Button>
							</div>
						</CardContent>
					</Card>
					<Card className="cursor-pointer hover:border-primary transition-colors flex flex-col">
						<CardHeader className="flex-1">
							<div className="flex items-center justify-between">
								<Upload className="h-8 w-8 text-primary" />
								<Badge variant="secondary">New</Badge>
							</div>
							<CardTitle className="mt-4">Upload Records</CardTitle>
							<CardDescription>
								Drop PDFs, photos, or scans of medical documents
							</CardDescription>
						</CardHeader>
						<CardContent>
							<Button
								className="w-full gap-2"
								onClick={() => setIsUploadDialogOpen(true)}
							>
								<Plus className="h-4 w-4" />
								Upload Files
							</Button>
						</CardContent>
					</Card>

					<Card className="cursor-pointer hover:border-primary transition-colors flex flex-col">
						<CardHeader className="flex-1">
							<FileText className="h-8 w-8 text-primary" />
							<CardTitle className="mt-4">View Timeline</CardTitle>
							<CardDescription>
								Browse your family's health history chronologically
							</CardDescription>
						</CardHeader>
						<CardContent>
							<Button
								variant="outline"
								className="w-full"
								onClick={() => setIsTimelineOpen(true)}
							>
								Open Timeline
							</Button>
						</CardContent>
					</Card>
				</div>{" "}
	
				{/* AI Health Insights */}
				<div className="mb-8">
					<SuggestionsSection />
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

			{/* Timeline Sheet */}
			<TimelineSheet open={isTimelineOpen} onOpenChange={setIsTimelineOpen} />
		</div>
	);
}
