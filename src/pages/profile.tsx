import { useRouter } from "@tanstack/react-router";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Edit, ArrowLeft, Calendar, Heart, Ruler, Weight, Droplet, User, Users, Plus, Save, X } from "lucide-react";
import { useProfileQuery } from "@/modules/profile/hooks/use-profile-query";
import { AppHeader } from "@/shared/components/app-header";
import { LoadingSpinner } from "@/shared/components/loading-spinner";
import { FamilyMembersDialog } from "@/modules/family-members/components/family-members-dialog";
import { useState } from "react";
import { useUpsertProfile } from "@/modules/profile/hooks/use-profile-mutations";

export default function Profile() {
	const router = useRouter();
	const queryResult = useProfileQuery();
	const [isFamilyDialogOpen, setIsFamilyDialogOpen] = useState(false);
	const [isEditingMedical, setIsEditingMedical] = useState(false);
	const { mutate: upsertProfile, isPending } = useUpsertProfile();

	const { data: profile, isLoading, error } = queryResult;

	const [allergies, setAllergies] = useState("");
	const [medications, setMedications] = useState("");
	const [chronicDiseases, setChronicDiseases] = useState("");
	const [familyHistory, setFamilyHistory] = useState("");

	const handleEdit = () => {
		router.navigate({ to: "/complete-profile" });
	};

	const handleEditMedical = () => {
		if (profile) {
			setAllergies(profile.allergies || "");
			setMedications(profile.medications || "");
			setChronicDiseases(profile.chronic_diseases || "");
			setFamilyHistory(profile.family_history || "");
			setIsEditingMedical(true);
		}
	};

	const handleSaveMedical = () => {
		if (profile) {
			upsertProfile(
				{
					name: profile.name!,
					last_name: profile.last_name!,
					birth_date: profile.birth_date!,
					biological_sex: profile.biological_sex!,
					blood_type: profile.blood_type,
					height_cm: profile.height_cm,
					weight_kg: profile.weight_kg,
					allergies: allergies || null,
					medications: medications || null,
					chronic_diseases: chronicDiseases || null,
					family_history: familyHistory || null,
					is_complete: true,
				},
				{
					onSuccess: () => {
						setIsEditingMedical(false);
					},
				}
			);
		}
	};

	const handleCancelMedical = () => {
		setIsEditingMedical(false);
	};

	if (isLoading) {
		return (
			<div className="min-h-screen bg-background">
				<AppHeader />
				<LoadingSpinner message="Loading profile..." />
			</div>
		);
	}

	if (error) {
		return (
			<div className="min-h-screen bg-background">
				<AppHeader />
				<div className="flex items-center justify-center py-20 px-4">
					<Card className="w-full max-w-2xl p-8 text-center">
						<p className="text-destructive mb-4">Error loading profile</p>
						<Button onClick={() => router.navigate({ to: "/dashboard" })}>
							Back to Dashboard
						</Button>
					</Card>
				</div>
			</div>
		);
	}

	if (!profile) {
		return (
			<div className="min-h-screen bg-background">
				<AppHeader />
				<div className="flex items-center justify-center py-20 px-4">
					<Card className="w-full max-w-2xl p-8 text-center">
						<p className="text-muted-foreground mb-4">Profile not found.</p>
						<Button
							onClick={() => router.navigate({ to: "/complete-profile" })}
						>
							Create Profile
						</Button>
					</Card>
				</div>
			</div>
		);
	}

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	};

	const calculateAge = (birthDate: string) => {
		const today = new Date();
		const birth = new Date(birthDate);
		let age = today.getFullYear() - birth.getFullYear();
		const monthDiff = today.getMonth() - birth.getMonth();
		if (
			monthDiff < 0 ||
			(monthDiff === 0 && today.getDate() < birth.getDate())
		) {
			age--;
		}
		return age;
	};

	const calculateBMI = () => {
		if (profile.height_cm && profile.weight_kg) {
			const bmi = profile.weight_kg / Math.pow(profile.height_cm / 100, 2);
			return bmi.toFixed(1);
		}
		return null;
	};

	const getBMICategory = (bmi: number) => {
		if (bmi < 18.5) return { label: "Underweight", color: "text-blue-600" };
		if (bmi < 25) return { label: "Normal", color: "text-green-600" };
		if (bmi < 30) return { label: "Overweight", color: "text-orange-600" };
		return { label: "Obese", color: "text-red-600" };
	};

	const bmi = calculateBMI();
	const bmiCategory = bmi ? getBMICategory(parseFloat(bmi)) : null;

	return (
		<div className="min-h-screen bg-background">
			<AppHeader />

			<main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
				<div className="mb-8 flex items-center justify-between">
					<div>
						<Button
							variant="ghost"
							size="sm"
							onClick={() => router.navigate({ to: "/dashboard" })}
							className="mb-4 gap-2"
						>
							<ArrowLeft className="h-4 w-4" />
							Back to Dashboard
						</Button>
						<h1 className="text-3xl font-bold tracking-tight">
							{profile.name && profile.last_name
								? `${profile.name} ${profile.last_name}`
								: "My Profile"}
						</h1>
						<p className="text-muted-foreground mt-1">
							View and manage your personal health information
						</p>
					</div>
					<Button onClick={handleEdit} className="gap-2">
						<Edit className="h-4 w-4" />
						Edit Profile
					</Button>
				</div>

				<div className="grid gap-6 lg:grid-cols-3">
					{/* Main Profile Info */}
					<div className="lg:col-span-2 space-y-6">
						{/* Personal Information */}
						<Card className="p-6">
							<h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
								<User className="h-5 w-5 text-primary" />
								Personal Information
							</h2>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<div>
									<label className="text-sm font-medium text-muted-foreground block mb-1">
										First Name
									</label>
									<p className="text-lg">{profile.name || "Not provided"}</p>
								</div>
								<div>
									<label className="text-sm font-medium text-muted-foreground block mb-1">
										Last Name
									</label>
									<p className="text-lg">
										{profile.last_name || "Not provided"}
									</p>
								</div>
								<div>
									<label className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-1">
										<Calendar className="h-3.5 w-3.5" />
										Date of Birth
									</label>
									<p className="text-lg">
										{profile.birth_date ? (
											<>
												{formatDate(profile.birth_date)}
												<span className="text-sm text-muted-foreground ml-2">
													({calculateAge(profile.birth_date)} years)
												</span>
											</>
										) : (
											"Not provided"
										)}
									</p>
								</div>
								<div>
									<label className="text-sm font-medium text-muted-foreground block mb-1">
										Biological Sex
									</label>
									<p className="text-lg capitalize">
										{profile.biological_sex?.replace("_", " ") ||
											"Not provided"}
									</p>
								</div>
							</div>
						</Card>

						{/* Medical Information */}
						<Card className="p-6">
							<div className="flex items-center justify-between mb-6">
								<h2 className="text-xl font-semibold flex items-center gap-2">
									<Heart className="h-5 w-5 text-primary" />
									Medical Information
								</h2>
								{!isEditingMedical && (
									<Button
										variant="outline"
										size="sm"
										onClick={handleEditMedical}
										className="gap-2"
									>
										<Edit className="h-4 w-4" />
										Edit
									</Button>
								)}
							</div>

							{isEditingMedical ? (
								<div className="space-y-4">
									<div className="space-y-2">
										<label htmlFor="allergies" className="text-sm font-medium">
											Allergies
										</label>
										<textarea
											id="allergies"
											value={allergies}
											onChange={(e) => setAllergies(e.target.value)}
											rows={3}
											className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
											placeholder="List any allergies (e.g., peanuts, penicillin, latex)"
										/>
									</div>

									<div className="space-y-2">
										<label
											htmlFor="medications"
											className="text-sm font-medium"
										>
											Current Medications
										</label>
										<textarea
											id="medications"
											value={medications}
											onChange={(e) => setMedications(e.target.value)}
											rows={3}
											className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
											placeholder="List any medications you're currently taking"
										/>
									</div>

									<div className="space-y-2">
										<label
											htmlFor="chronicDiseases"
											className="text-sm font-medium"
										>
											Chronic Conditions
										</label>
										<textarea
											id="chronicDiseases"
											value={chronicDiseases}
											onChange={(e) => setChronicDiseases(e.target.value)}
											rows={3}
											className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
											placeholder="List any chronic conditions (e.g., diabetes, hypertension, asthma)"
										/>
									</div>

									<div className="space-y-2">
										<label
											htmlFor="familyHistory"
											className="text-sm font-medium"
										>
											Family Medical History
										</label>
										<textarea
											id="familyHistory"
											value={familyHistory}
											onChange={(e) => setFamilyHistory(e.target.value)}
											rows={3}
											className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
											placeholder="List any relevant family medical history"
										/>
									</div>

									<div className="flex gap-2 pt-2">
										<Button
											onClick={handleSaveMedical}
											disabled={isPending}
											className="gap-2"
										>
											<Save className="h-4 w-4" />
											{isPending ? "Saving..." : "Save"}
										</Button>
										<Button
											variant="outline"
											onClick={handleCancelMedical}
											disabled={isPending}
											className="gap-2"
										>
											<X className="h-4 w-4" />
											Cancel
										</Button>
									</div>
								</div>
							) : (
								<div className="space-y-4">
									{profile.allergies ||
									profile.medications ||
									profile.chronic_diseases ||
									profile.family_history ? (
										<>
											{profile.allergies && (
												<div>
													<label className="text-sm font-medium text-muted-foreground block mb-1">
														Allergies
													</label>
													<p className="text-base">{profile.allergies}</p>
												</div>
											)}
											{profile.medications && (
												<div>
													<label className="text-sm font-medium text-muted-foreground block mb-1">
														Current Medications
													</label>
													<p className="text-base">{profile.medications}</p>
												</div>
											)}
											{profile.chronic_diseases && (
												<div>
													<label className="text-sm font-medium text-muted-foreground block mb-1">
														Chronic Conditions
													</label>
													<p className="text-base">
														{profile.chronic_diseases}
													</p>
												</div>
											)}
											{profile.family_history && (
												<div>
													<label className="text-sm font-medium text-muted-foreground block mb-1">
														Family History
													</label>
													<p className="text-base">{profile.family_history}</p>
												</div>
											)}
										</>
									) : (
										<div className="text-center py-6">
											<p className="text-sm text-muted-foreground mb-3">
												No medical information added yet
											</p>
											<Button
												variant="outline"
												size="sm"
												onClick={handleEditMedical}
												className="gap-2"
											>
												<Plus className="h-4 w-4" />
												Add Medical Information
											</Button>
										</div>
									)}
								</div>
							)}
						</Card>
					</div>{" "}
					{/* Health Metrics Sidebar */}
					<div className="space-y-6">
						{/* Blood Type */}
						{profile.blood_type && (
							<Card className="p-6">
								<div className="flex items-center gap-3 mb-2">
									<div className="p-2 bg-red-100 rounded-lg">
										<Droplet className="h-5 w-5 text-red-600" />
									</div>
									<div>
										<p className="text-sm font-medium text-muted-foreground">
											Blood Type
										</p>
										<p className="text-2xl font-bold">{profile.blood_type}</p>
									</div>
								</div>
							</Card>
						)}

						{/* Height */}
						{profile.height_cm && (
							<Card className="p-6">
								<div className="flex items-center gap-3 mb-2">
									<div className="p-2 bg-blue-100 rounded-lg">
										<Ruler className="h-5 w-5 text-blue-600" />
									</div>
									<div>
										<p className="text-sm font-medium text-muted-foreground">
											Height
										</p>
										<p className="text-2xl font-bold">{profile.height_cm} cm</p>
										<p className="text-sm text-muted-foreground">
											{(profile.height_cm / 30.48).toFixed(1)} ft
										</p>
									</div>
								</div>
							</Card>
						)}

						{/* Weight */}
						{profile.weight_kg && (
							<Card className="p-6">
								<div className="flex items-center gap-3 mb-2">
									<div className="p-2 bg-purple-100 rounded-lg">
										<Weight className="h-5 w-5 text-purple-600" />
									</div>
									<div>
										<p className="text-sm font-medium text-muted-foreground">
											Weight
										</p>
										<p className="text-2xl font-bold">{profile.weight_kg} kg</p>
										<p className="text-sm text-muted-foreground">
											{(profile.weight_kg * 2.20462).toFixed(1)} lbs
										</p>
									</div>
								</div>
							</Card>
						)}

						{/* BMI */}
						{bmi && (
							<Card className="p-6">
								<div className="flex items-center gap-3 mb-2">
									<div className="p-2 bg-green-100 rounded-lg">
										<Heart className="h-5 w-5 text-green-600" />
									</div>
									<div>
										<p className="text-sm font-medium text-muted-foreground">
											BMI
										</p>
										<p className="text-2xl font-bold">{bmi}</p>
										{bmiCategory && (
											<p className={`text-sm font-medium ${bmiCategory.color}`}>
												{bmiCategory.label}
											</p>
										)}
									</div>
								</div>
							</Card>
						)}
					</div>
				</div>

				{/* Family Members Section */}
				<div className="mt-8">
					<Card>
						<CardHeader className="flex flex-row items-center justify-between">
							<div>
								<CardTitle className="flex items-center gap-2">
									<Users className="h-5 w-5" />
									Family Members
								</CardTitle>
								<CardDescription className="mt-1">
									Add family members to track their health records and share
									information
								</CardDescription>
							</div>
							<Button
								variant="outline"
								className="gap-2"
								onClick={() => setIsFamilyDialogOpen(true)}
							>
								<Plus className="h-4 w-4" />
								Add Member
							</Button>
						</CardHeader>
					</Card>
				</div>
			</main>

			{/* Family Members Dialog */}
			<FamilyMembersDialog
				open={isFamilyDialogOpen}
				onOpenChange={setIsFamilyDialogOpen}
			/>
		</div>
	);
}
