import { useRouter } from "@tanstack/react-router";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/shared/ui/select";
import {
	Edit,
	ArrowLeft,
	Calendar,
	Heart,
	Ruler,
	Weight,
	Droplet,
	User,
	Save,
	X,
	Activity,
	FileText,
	AlertCircle,
	History,
	Settings,
} from "lucide-react";
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
	const [isEditingDemographics, setIsEditingDemographics] = useState(false);
	const [isEditingVitals, setIsEditingVitals] = useState(false);
	const [isEditingMedical, setIsEditingMedical] = useState(false);
	const { mutate: upsertProfile, isPending } = useUpsertProfile();

	const { data: profile, isLoading, error } = queryResult;

	// Demographics state
	const [name, setName] = useState("");
	const [lastName, setLastName] = useState("");
	const [birthDate, setBirthDate] = useState("");
	const [biologicalSex, setBiologicalSex] = useState("");
	const [bloodType, setBloodType] = useState("");

	// Vitals state
	const [height, setHeight] = useState("");
	const [weight, setWeight] = useState("");

	// Medical state
	const [allergies, setAllergies] = useState("");
	const [medications, setMedications] = useState("");
	const [chronicDiseases, setChronicDiseases] = useState("");
	const [familyHistory, setFamilyHistory] = useState("");

	const handleEditDemographics = () => {
		if (profile) {
			setName(profile.name || "");
			setLastName(profile.last_name || "");
			setBirthDate(profile.birth_date || "");
			setBiologicalSex(profile.biological_sex || "");
			setBloodType(profile.blood_type || "");
			setIsEditingDemographics(true);
		}
	};

	const handleSaveDemographics = () => {
		if (profile) {
			upsertProfile(
				{
					name: name || undefined,
					last_name: lastName || undefined,
					birth_date: birthDate || undefined,
					biological_sex: biologicalSex || undefined,
					blood_type: bloodType || undefined,
					height_cm: profile.height_cm,
					weight_kg: profile.weight_kg,
					allergies: profile.allergies,
					medications: profile.medications,
					chronic_diseases: profile.chronic_diseases,
					family_history: profile.family_history,
					is_complete: true,
				},
				{
					onSuccess: () => {
						setIsEditingDemographics(false);
					},
				}
			);
		}
	};

	const handleCancelDemographics = () => {
		setIsEditingDemographics(false);
	};

	const handleEditVitals = () => {
		if (profile) {
			setHeight(profile.height_cm?.toString() || "");
			setWeight(profile.weight_kg?.toString() || "");
			setIsEditingVitals(true);
		}
	};

	const handleSaveVitals = () => {
		if (profile) {
			upsertProfile(
				{
					name: profile.name!,
					last_name: profile.last_name!,
					birth_date: profile.birth_date!,
					biological_sex: profile.biological_sex!,
					blood_type: profile.blood_type,
					height_cm: height ? parseFloat(height) : null,
					weight_kg: weight ? parseFloat(weight) : null,
					allergies: profile.allergies,
					medications: profile.medications,
					chronic_diseases: profile.chronic_diseases,
					family_history: profile.family_history,
					is_complete: true,
				},
				{
					onSuccess: () => {
						setIsEditingVitals(false);
					},
				}
			);
		}
	};

	const handleCancelVitals = () => {
		setIsEditingVitals(false);
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

			<main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
				{/* Header */}
				<div className="mb-6">
					<Button
						variant="ghost"
						size="sm"
						onClick={() => router.navigate({ to: "/dashboard" })}
						className="mb-3 gap-2 text-muted-foreground hover:text-foreground"
					>
						<ArrowLeft className="h-4 w-4" />
						Back
					</Button>
					<div className="flex items-start justify-between">
						<div>
							<h1 className="text-2xl font-semibold tracking-tight">
								Patient Information
							</h1>
							<p className="text-sm text-muted-foreground mt-1">
								Medical Record ·{" "}
								{profile.name && profile.last_name
									? `${profile.name} ${profile.last_name}`
									: "Patient Profile"}
							</p>
						</div>
						<Button
							variant="outline"
							size="sm"
							onClick={() => setIsFamilyDialogOpen(true)}
							className="gap-2"
						>
							<Settings className="h-4 w-4" />
							Manage Members
						</Button>
					</div>
				</div>

				{/* Demographics Card */}
				<Card className="mb-6">
					<div className="border-b px-6 py-4 flex items-center justify-between">
						<h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-2">
							<User className="h-4 w-4" />
							Demographics
						</h2>
						{!isEditingDemographics && (
							<Button
								variant="ghost"
								size="sm"
								onClick={handleEditDemographics}
								className="gap-2 h-8"
							>
								<Edit className="h-3.5 w-3.5" />
								Edit
							</Button>
						)}
					</div>
					<div className="p-6">
						{isEditingDemographics ? (
							<div className="space-y-6">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div className="space-y-2">
										<label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
											First Name
										</label>
										<Input
											value={name}
											onChange={(e) => setName(e.target.value)}
											placeholder="First name"
										/>
									</div>
									<div className="space-y-2">
										<label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
											Last Name
										</label>
										<Input
											value={lastName}
											onChange={(e) => setLastName(e.target.value)}
											placeholder="Last name"
										/>
									</div>
									<div className="space-y-2">
										<label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
											Date of Birth
										</label>
										<Input
											type="date"
											value={birthDate}
											onChange={(e) => setBirthDate(e.target.value)}
										/>
									</div>
									<div className="space-y-2">
										<label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
											Sex
										</label>
										<Select
											value={biologicalSex}
											onValueChange={setBiologicalSex}
										>
											<SelectTrigger>
												<SelectValue placeholder="Select sex" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="male">Male</SelectItem>
												<SelectItem value="female">Female</SelectItem>
												<SelectItem value="intersex">Intersex</SelectItem>
											</SelectContent>
										</Select>
									</div>
								</div>
								<div className="space-y-2">
									<label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
										Blood Type
									</label>
									<Select value={bloodType} onValueChange={setBloodType}>
										<SelectTrigger className="w-full md:w-48">
											<SelectValue placeholder="Select blood type" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="A+">A+</SelectItem>
											<SelectItem value="A-">A-</SelectItem>
											<SelectItem value="B+">B+</SelectItem>
											<SelectItem value="B-">B-</SelectItem>
											<SelectItem value="AB+">AB+</SelectItem>
											<SelectItem value="AB-">AB-</SelectItem>
											<SelectItem value="O+">O+</SelectItem>
											<SelectItem value="O-">O-</SelectItem>
										</SelectContent>
									</Select>
								</div>
								<div className="flex gap-2 pt-2">
									<Button
										onClick={handleSaveDemographics}
										disabled={isPending}
										size="sm"
										className="gap-2"
									>
										<Save className="h-3.5 w-3.5" />
										{isPending ? "Saving..." : "Save Changes"}
									</Button>
									<Button
										variant="outline"
										onClick={handleCancelDemographics}
										disabled={isPending}
										size="sm"
										className="gap-2"
									>
										<X className="h-3.5 w-3.5" />
										Cancel
									</Button>
								</div>
							</div>
						) : (
							<div className="grid grid-cols-1 md:grid-cols-4 gap-6">
								<div>
									<label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
										Full Name
									</label>
									<p className="text-base font-medium mt-1">
										{profile.name && profile.last_name
											? `${profile.name} ${profile.last_name}`
											: "—"}
									</p>
								</div>
								<div>
									<label className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1">
										<Calendar className="h-3 w-3" />
										Date of Birth
									</label>
									<p className="text-base font-medium mt-1">
										{profile.birth_date ? formatDate(profile.birth_date) : "—"}
									</p>
									{profile.birth_date && (
										<p className="text-xs text-muted-foreground mt-0.5">
											{calculateAge(profile.birth_date)} years old
										</p>
									)}
								</div>
								<div>
									<label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
										Sex
									</label>
									<p className="text-base font-medium mt-1 capitalize">
										{profile.biological_sex?.replace("_", " ") || "—"}
									</p>
								</div>
								<div>
									<label className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1">
										<Droplet className="h-3 w-3" />
										Blood Type
									</label>
									<p className="text-base font-medium mt-1">
										{profile.blood_type || "—"}
									</p>
								</div>
							</div>
						)}
					</div>
				</Card>

				{/* Vital Signs Card */}
				<Card className="mb-6">
					<div className="border-b px-6 py-4 flex items-center justify-between">
						<h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-2">
							<Activity className="h-4 w-4" />
							Vital Signs & Metrics
						</h2>
						{!isEditingVitals && (
							<Button
								variant="ghost"
								size="sm"
								onClick={handleEditVitals}
								className="gap-2 h-8"
							>
								<Edit className="h-3.5 w-3.5" />
								Edit
							</Button>
						)}
					</div>
					<div className="p-6">
						{isEditingVitals ? (
							<div className="space-y-6">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div className="space-y-2">
										<label className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
											<Ruler className="h-3.5 w-3.5" />
											Height (cm)
										</label>
										<Input
											type="number"
											value={height}
											onChange={(e) => setHeight(e.target.value)}
											placeholder="e.g., 170"
										/>
									</div>
									<div className="space-y-2">
										<label className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
											<Weight className="h-3.5 w-3.5" />
											Weight (kg)
										</label>
										<Input
											type="number"
											value={weight}
											onChange={(e) => setWeight(e.target.value)}
											placeholder="e.g., 70"
										/>
									</div>
								</div>
								<div className="flex gap-2 pt-2">
									<Button
										onClick={handleSaveVitals}
										disabled={isPending}
										size="sm"
										className="gap-2"
									>
										<Save className="h-3.5 w-3.5" />
										{isPending ? "Saving..." : "Save Changes"}
									</Button>
									<Button
										variant="outline"
										onClick={handleCancelVitals}
										disabled={isPending}
										size="sm"
										className="gap-2"
									>
										<X className="h-3.5 w-3.5" />
										Cancel
									</Button>
								</div>
							</div>
						) : (
							<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
								<div className="flex items-start gap-3">
									<div className="p-2 bg-blue-50 rounded-md">
										<Ruler className="h-4 w-4 text-blue-600" />
									</div>
									<div>
										<label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
											Height
										</label>
										<p className="text-base font-medium mt-1">
											{profile.height_cm ? `${profile.height_cm} cm` : "—"}
										</p>
										{profile.height_cm && (
											<p className="text-xs text-muted-foreground mt-0.5">
												{(profile.height_cm / 30.48).toFixed(1)} ft
											</p>
										)}
									</div>
								</div>
								<div className="flex items-start gap-3">
									<div className="p-2 bg-purple-50 rounded-md">
										<Weight className="h-4 w-4 text-purple-600" />
									</div>
									<div>
										<label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
											Weight
										</label>
										<p className="text-base font-medium mt-1">
											{profile.weight_kg ? `${profile.weight_kg} kg` : "—"}
										</p>
										{profile.weight_kg && (
											<p className="text-xs text-muted-foreground mt-0.5">
												{(profile.weight_kg * 2.20462).toFixed(1)} lbs
											</p>
										)}
									</div>
								</div>
								<div className="flex items-start gap-3">
									<div className="p-2 bg-green-50 rounded-md">
										<Heart className="h-4 w-4 text-green-600" />
									</div>
									<div>
										<label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
											BMI
										</label>
										<p className="text-base font-medium mt-1">{bmi || "—"}</p>
										{bmiCategory && (
											<p
												className={`text-xs font-medium mt-0.5 ${bmiCategory.color}`}
											>
												{bmiCategory.label}
											</p>
										)}
									</div>
								</div>
							</div>
						)}
					</div>
				</Card>

				{/* Clinical Information Card */}
				<Card className="mb-6">
					<div className="border-b px-6 py-4 flex items-center justify-between">
						<h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-2">
							<FileText className="h-4 w-4" />
							Clinical Information
						</h2>
						{!isEditingMedical && (
							<Button
								variant="ghost"
								size="sm"
								onClick={handleEditMedical}
								className="gap-2 h-8"
							>
								<Edit className="h-3.5 w-3.5" />
								Edit
							</Button>
						)}
					</div>
					<div className="p-6">
						{isEditingMedical ? (
							<div className="space-y-6">
								<div className="space-y-2">
									<label
										htmlFor="allergies"
										className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1.5"
									>
										<AlertCircle className="h-3.5 w-3.5" />
										Allergies
									</label>
									<textarea
										id="allergies"
										value={allergies}
										onChange={(e) => setAllergies(e.target.value)}
										rows={2}
										className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
										placeholder="e.g., Penicillin, Peanuts, Latex"
									/>
								</div>

								<div className="space-y-2">
									<label
										htmlFor="medications"
										className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1.5"
									>
										<FileText className="h-3.5 w-3.5" />
										Current Medications
									</label>
									<textarea
										id="medications"
										value={medications}
										onChange={(e) => setMedications(e.target.value)}
										rows={2}
										className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
										placeholder="e.g., Metformin 500mg twice daily"
									/>
								</div>

								<div className="space-y-2">
									<label
										htmlFor="chronicDiseases"
										className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1.5"
									>
										<Heart className="h-3.5 w-3.5" />
										Chronic Conditions
									</label>
									<textarea
										id="chronicDiseases"
										value={chronicDiseases}
										onChange={(e) => setChronicDiseases(e.target.value)}
										rows={2}
										className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
										placeholder="e.g., Type 2 Diabetes, Hypertension"
									/>
								</div>

								<div className="space-y-2">
									<label
										htmlFor="familyHistory"
										className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1.5"
									>
										<History className="h-3.5 w-3.5" />
										Family Medical History
									</label>
									<textarea
										id="familyHistory"
										value={familyHistory}
										onChange={(e) => setFamilyHistory(e.target.value)}
										rows={2}
										className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
										placeholder="e.g., Father: Heart Disease, Mother: Diabetes"
									/>
								</div>

								<div className="flex gap-2 pt-2">
									<Button
										onClick={handleSaveMedical}
										disabled={isPending}
										size="sm"
										className="gap-2"
									>
										<Save className="h-3.5 w-3.5" />
										{isPending ? "Saving..." : "Save Changes"}
									</Button>
									<Button
										variant="outline"
										onClick={handleCancelMedical}
										disabled={isPending}
										size="sm"
										className="gap-2"
									>
										<X className="h-3.5 w-3.5" />
										Cancel
									</Button>
								</div>
							</div>
						) : (
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								{profile.allergies ||
								profile.medications ||
								profile.chronic_diseases ||
								profile.family_history ? (
									<>
										<div>
											<label className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1.5 mb-2">
												<AlertCircle className="h-3.5 w-3.5" />
												Allergies
											</label>
											<p className="text-sm">
												{profile.allergies || "None reported"}
											</p>
										</div>
										<div>
											<label className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1.5 mb-2">
												<FileText className="h-3.5 w-3.5" />
												Current Medications
											</label>
											<p className="text-sm">
												{profile.medications || "None reported"}
											</p>
										</div>
										<div>
											<label className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1.5 mb-2">
												<Heart className="h-3.5 w-3.5" />
												Chronic Conditions
											</label>
											<p className="text-sm">
												{profile.chronic_diseases || "None reported"}
											</p>
										</div>
										<div>
											<label className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1.5 mb-2">
												<History className="h-3.5 w-3.5" />
												Family Medical History
											</label>
											<p className="text-sm">
												{profile.family_history || "None reported"}
											</p>
										</div>
									</>
								) : (
									<div className="col-span-2 text-center py-8">
										<FileText className="h-8 w-8 text-muted-foreground/50 mx-auto mb-3" />
										<p className="text-sm text-muted-foreground mb-3">
											No clinical information on file
										</p>
										<Button
											variant="outline"
											size="sm"
											onClick={handleEditMedical}
											className="gap-2"
										>
											<Edit className="h-3.5 w-3.5" />
											Add Information
										</Button>
									</div>
								)}
							</div>
						)}
					</div>
				</Card>
			</main>

			{/* Family Members Dialog */}
			<FamilyMembersDialog
				open={isFamilyDialogOpen}
				onOpenChange={setIsFamilyDialogOpen}
			/>
		</div>
	);
}
