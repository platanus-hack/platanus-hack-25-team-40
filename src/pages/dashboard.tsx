import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { FileText, Plus, Upload, UserCircle } from "lucide-react";
import { UploadHealthRecordCard } from "@/modules/health-records/components/upload-record-card";
import { TimelineSheet } from "@/modules/health-records/components/timeline-sheet";
import { useState } from "react";
import { useRouter } from "@tanstack/react-router";
import { AppHeader } from "@/shared/components/app-header";
import { useProfileQuery } from "@/modules/profile/hooks/use-profile-query";

export default function Dashboard() {
	const router = useRouter();
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

				<UploadHealthRecordCard />

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
					<Card className="cursor-pointer hover:border-primary transition-colors">
						<CardHeader>
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
							<Button className="w-full gap-2">
								<Plus className="h-4 w-4" />
								Upload Files
							</Button>
						</CardContent>
					</Card>

					<Card className="cursor-pointer hover:border-primary transition-colors">
						<CardHeader>
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
				</div>

				{/* Stats Overview */}
				<div className="grid gap-4 md:grid-cols-4 mb-8">
					<Card>
						<CardHeader className="pb-2">
							<CardDescription>Total Records</CardDescription>
							<CardTitle className="text-3xl">0</CardTitle>
						</CardHeader>
					</Card>

					<Card>
						<CardHeader className="pb-2">
							<CardDescription>Family Members</CardDescription>
							<CardTitle className="text-3xl">1</CardTitle>
						</CardHeader>
					</Card>

					<Card>
						<CardHeader className="pb-2">
							<CardDescription>Recent Uploads</CardDescription>
							<CardTitle className="text-3xl">0</CardTitle>
						</CardHeader>
					</Card>

					<Card>
						<CardHeader className="pb-2">
							<CardDescription>Categories</CardDescription>
							<CardTitle className="text-3xl">0</CardTitle>
						</CardHeader>
					</Card>
				</div>

				{/* Recent Activity */}
				<Card>
					<CardHeader>
						<CardTitle>Recent Activity</CardTitle>
						<CardDescription>
							Your latest health record interactions
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="flex flex-col items-center justify-center py-12 text-center">
							<FileText className="h-12 w-12 text-muted-foreground mb-4" />
							<h3 className="font-semibold mb-2">No records yet</h3>
							<p className="text-sm text-muted-foreground mb-4 max-w-sm">
								Start by uploading your first medical document. Our AI will
								automatically organize and explain it for you.
							</p>
							<Button className="gap-2">
								<Upload className="h-4 w-4" />
								Upload Your First Record
							</Button>
						</div>
					</CardContent>
				</Card>
			</main>

			{/* Timeline Sheet */}
			<TimelineSheet open={isTimelineOpen} onOpenChange={setIsTimelineOpen} />
		</div>
	);
}
