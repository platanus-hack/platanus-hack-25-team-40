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
	Users,
	Save,
	X,
	Activity,
	FileText,
	AlertCircle,
	History,
	Settings,
	Vault,
} from "lucide-react";
import { useProfileQuery } from "@/modules/profile/hooks/use-profile-query";
import { useFamilyMembers } from "@/modules/family-members/hooks/use-family-members-query";
import { AppHeader } from "@/shared/components/app-header";
import { LoadingSpinner } from "@/shared/components/loading-spinner";
import { FamilyMembersDialog } from "@/modules/family-members/components/family-members-dialog";
import { useState } from "react";
import { useUpsertProfile } from "@/modules/profile/hooks/use-profile-mutations";
import { useTranslation } from "react-i18next";

export default function Profile() {
	const { t } = useTranslation("profile");
	const router = useRouter();
	const queryResult = useProfileQuery();
	const { data: familyMembers, isLoading: familyMembersLoading } =
		useFamilyMembers();
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
				<LoadingSpinner message={t("messages.loadingProfile")} />
			</div>
		);
	}

	if (error) {
		return (
			<div className="min-h-screen bg-background">
				<AppHeader />
				<div className="flex items-center justify-center py-20 px-4">
					<Card className="w-full max-w-2xl p-8 text-center">
						<p className="text-destructive mb-4">{t("messages.errorLoading")}</p>
						<Button onClick={() => router.navigate({ to: "/dashboard" })}>
							{t("messages.backToDashboard")}
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
						<p className="text-muted-foreground mb-4">{t("messages.profileNotFound")}</p>
						<Button
							onClick={() => router.navigate({ to: "/complete-profile" })}
						>
							{t("messages.createProfile")}
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
		if (bmi < 18.5)
			return {
				label: t("sections.vitals.bmiCategories.underweight"),
				color: "text-blue-600",
			};
		if (bmi < 25)
			return {
				label: t("sections.vitals.bmiCategories.normal"),
				color: "text-green-600",
			};
		if (bmi < 30)
			return {
				label: t("sections.vitals.bmiCategories.overweight"),
				color: "text-orange-600",
			};
		return {
			label: t("sections.vitals.bmiCategories.obese"),
			color: "text-red-600",
		};
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
						{t("actions.back")}
					</Button>
					<div>
						<h1 className="text-2xl font-semibold tracking-tight">
							{t("title")}
						</h1>
						<p className="text-sm text-muted-foreground mt-1">
							{t("subtitle")} ·{" "}
							{profile.name && profile.last_name
								? `${profile.name} ${profile.last_name}`
								: t("title")}
						</p>
					</div>
				</div>

				{/* Two Column Layout */}
				<div className="grid gap-6 lg:grid-cols-3">
					{/* Left Column - Main Content */}
					<div className="lg:col-span-2 space-y-6">
						{/* Demographics Card */}
						<Card>
							<div className="border-b px-6 py-4 flex items-center justify-between">
								<h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-2">
									<User className="h-4 w-4" />
									{t("sections.demographics.title")}
								</h2>
								{!isEditingDemographics && (
									<Button
										variant="ghost"
										size="sm"
										onClick={handleEditDemographics}
										className="gap-2 h-8"
									>
										<Edit className="h-3.5 w-3.5" />
										{t("actions.edit")}
									</Button>
								)}
							</div>
							<div className="p-6">
								{isEditingDemographics ? (
									<div className="space-y-6">
										<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
											<div className="space-y-2">
												<label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
													{t("sections.demographics.fields.firstName")}
												</label>
												<Input
													value={name}
													onChange={(e) => setName(e.target.value)}
													placeholder={t(
														"sections.demographics.fields.firstName"
													)}
												/>
											</div>
											<div className="space-y-2">
												<label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
													{t("sections.demographics.fields.lastName")}
												</label>
												<Input
													value={lastName}
													onChange={(e) => setLastName(e.target.value)}
													placeholder={t(
														"sections.demographics.fields.lastName"
													)}
												/>
											</div>
											<div className="space-y-2">
												<label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
													{t("sections.demographics.fields.dateOfBirth")}
												</label>
												<Input
													type="date"
													value={birthDate}
													onChange={(e) => setBirthDate(e.target.value)}
												/>
											</div>
											<div className="space-y-2">
												<label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
													{t("sections.demographics.fields.sex")}
												</label>
												<Select
													value={biologicalSex}
													onValueChange={setBiologicalSex}
												>
													<SelectTrigger>
														<SelectValue
															placeholder={t(
																"sections.demographics.fields.sex"
															)}
														/>
													</SelectTrigger>
													<SelectContent>
														<SelectItem value="male">
															{t("sections.demographics.sexOptions.male")}
														</SelectItem>
														<SelectItem value="female">
															{t("sections.demographics.sexOptions.female")}
														</SelectItem>
														<SelectItem value="intersex">
															{t("sections.demographics.sexOptions.intersex")}
														</SelectItem>
													</SelectContent>
												</Select>
											</div>
										</div>
										<div className="space-y-2">
											<label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
												{t("sections.demographics.fields.bloodType")}
											</label>
											<Select value={bloodType} onValueChange={setBloodType}>
												<SelectTrigger className="w-full md:w-48">
													<SelectValue
														placeholder={t(
															"sections.demographics.bloodTypes.select"
														)}
													/>
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
												{isPending ? t("actions.saving") : t("actions.save")}
											</Button>
											<Button
												variant="outline"
												onClick={handleCancelDemographics}
												disabled={isPending}
												size="sm"
												className="gap-2"
											>
												<X className="h-3.5 w-3.5" />
												{t("actions.cancel")}
											</Button>
										</div>
									</div>
								) : (
									<div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
										<div className="flex flex-col gap-1">
											<label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
												{t("sections.demographics.fields.fullName")}
											</label>
											<p className="text-base font-medium">
												{profile.name && profile.last_name
													? `${profile.name} ${profile.last_name}`
													: "—"}
											</p>
										</div>
										<div className="flex flex-col gap-1">
											<label className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1">
												<Calendar className="h-3 w-3" />
												{t("sections.demographics.fields.dateOfBirth")}
											</label>
											<p className="text-base font-medium">
												{profile.birth_date
													? formatDate(profile.birth_date)
													: "—"}
											</p>
											{profile.birth_date && (
												<p className="text-xs text-muted-foreground mt-0.5">
													{calculateAge(profile.birth_date)}{" "}
													{t("sections.demographics.fields.age")}
												</p>
											)}
										</div>
										<div className="flex flex-col gap-1">
											<label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
												{t("sections.demographics.fields.sex")}
											</label>
											<p className="text-base font-medium capitalize">
												{profile.biological_sex ? t(`sections.demographics.sexOptions.${profile.biological_sex}`) : "—"}
											</p>
										</div>
										<div className="flex flex-col gap-1">
											<label className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1">
												<Droplet className="h-3 w-3" />
												{t("sections.demographics.fields.bloodType")}
											</label>
											<p className="text-base font-medium">
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
									{t("sections.vitals.title")}
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
													{t("sections.vitals.fields.heightCm")}
												</label>
												<Input
													type="number"
													value={height}
													onChange={(e) => setHeight(e.target.value)}
													placeholder={t(
														"sections.vitals.fields.heightPlaceholder"
													)}
												/>
											</div>
											<div className="space-y-2">
												<label className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
													<Weight className="h-3.5 w-3.5" />
													{t("sections.vitals.fields.weightKg")}
												</label>
												<Input
													type="number"
													value={weight}
													onChange={(e) => setWeight(e.target.value)}
													placeholder={t(
														"sections.vitals.fields.weightPlaceholder"
													)}
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
												{isPending ? t("actions.saving") : t("actions.save")}
											</Button>
											<Button
												variant="outline"
												onClick={handleCancelVitals}
												disabled={isPending}
												size="sm"
												className="gap-2"
											>
												<X className="h-3.5 w-3.5" />
												{t("actions.cancel")}
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
													{t("sections.vitals.fields.height")}
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
													{t("sections.vitals.fields.weight")}
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
													{t("sections.vitals.fields.bmi")}
												</label>
												<p className="text-base font-medium mt-1">
													{bmi || "—"}
												</p>
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

						{/* {t("sections.clinical.title")} Card */}
						<Card className="mb-6">
							<div className="border-b px-6 py-4 flex items-center justify-between">
								<h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-2">
									<FileText className="h-4 w-4" />
									{t("sections.clinical.title")}
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
												{t("sections.clinical.fields.allergies")}
											</label>
											<textarea
												id="allergies"
												value={allergies}
												onChange={(e) => setAllergies(e.target.value)}
												rows={2}
												className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
												placeholder={t(
													"sections.clinical.placeholders.allergies"
												)}
											/>
										</div>

										<div className="space-y-2">
											<label
												htmlFor="medications"
												className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1.5"
											>
												<FileText className="h-3.5 w-3.5" />
												{t("sections.clinical.fields.medications")}
											</label>
											<textarea
												id="medications"
												value={medications}
												onChange={(e) => setMedications(e.target.value)}
												rows={2}
												className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
												placeholder={t(
													"sections.clinical.placeholders.medications"
												)}
											/>
										</div>

										<div className="space-y-2">
											<label
												htmlFor="chronicDiseases"
												className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1.5"
											>
												<Heart className="h-3.5 w-3.5" />
												{t("sections.clinical.fields.chronicDiseases")}
											</label>
											<textarea
												id="chronicDiseases"
												value={chronicDiseases}
												onChange={(e) => setChronicDiseases(e.target.value)}
												rows={2}
												className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
												placeholder={t(
													"sections.clinical.placeholders.chronicConditions"
												)}
											/>
										</div>

										<div className="space-y-2">
											<label
												htmlFor="familyHistory"
												className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1.5"
											>
												<History className="h-3.5 w-3.5" />
												{t("sections.clinical.fields.familyHistory")}
											</label>
											<textarea
												id="familyHistory"
												value={familyHistory}
												onChange={(e) => setFamilyHistory(e.target.value)}
												rows={2}
												className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
												placeholder={t(
													"sections.clinical.placeholders.familyHistory"
												)}
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
												{isPending ? t("actions.saving") : t("actions.save")}
											</Button>
											<Button
												variant="outline"
												onClick={handleCancelMedical}
												disabled={isPending}
												size="sm"
												className="gap-2"
											>
												<X className="h-3.5 w-3.5" />
												{t("actions.cancel")}
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
														{t("sections.clinical.fields.allergies")}
													</label>
													<p className="text-sm">
														{profile.allergies ||
															t("sections.clinical.noneReported")}
													</p>
												</div>
												<div>
													<label className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1.5 mb-2">
														<FileText className="h-3.5 w-3.5" />
														{t("sections.clinical.fields.medications")}
													</label>
													<p className="text-sm">
														{profile.medications ||
															t("sections.clinical.noneReported")}
													</p>
												</div>
												<div>
													<label className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1.5 mb-2">
														<Heart className="h-3.5 w-3.5" />
														{t("sections.clinical.fields.chronicDiseases")}
													</label>
													<p className="text-sm">
														{profile.chronic_diseases ||
															t("sections.clinical.noneReported")}
													</p>
												</div>
												<div>
													<label className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1.5 mb-2">
														<History className="h-3.5 w-3.5" />
														{t("sections.clinical.fields.familyHistory")}
													</label>
													<p className="text-sm">
														{profile.family_history ||
															t("sections.clinical.noneReported")}
													</p>
												</div>
											</>
										) : (
											<div className="col-span-2 text-center py-8">
												<FileText className="h-8 w-8 text-muted-foreground/50 mx-auto mb-3" />
												<p className="text-sm text-muted-foreground mb-3">
													{t("sections.clinical.noData")}
												</p>
												<Button
													variant="outline"
													size="sm"
													onClick={handleEditMedical}
													className="gap-2"
												>
													<Edit className="h-3.5 w-3.5" />
													{t("sections.clinical.addInformation")}
												</Button>
											</div>
										)}
									</div>
								)}
							</div>
						</Card>
					</div>

					{/* Right Column - {t("sections.familyMembers.title")} Sidebar */}
					<div className="lg:col-span-1 space-y-6">
						<Card>
							<div className="border-b px-6 py-4 flex items-center justify-between">
								<h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-2">
									<Users className="h-4 w-4" />
									{t("sections.familyMembers.title")}
								</h2>
								<Button
									variant="ghost"
									size="sm"
									onClick={() => setIsFamilyDialogOpen(true)}
									className="gap-2 h-8"
								>
									<Settings className="h-3.5 w-3.5" />
									{t("actions.manage")}
								</Button>
							</div>
							<div className="p-6">
								{familyMembersLoading ? (
									<div className="text-center py-4">
										<div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-current border-r-transparent" />
									</div>
								) : familyMembers && familyMembers.length > 0 ? (
									<div className="space-y-3">
										{familyMembers.map((member) => (
											<div
												key={member.id}
												className="flex items-center gap-3 p-3 rounded-md border bg-muted/30 hover:bg-muted/50 transition-colors"
											>
												<div className="p-2 bg-primary/10 rounded-full">
													<User className="h-4 w-4 text-primary" />
												</div>
												<div className="flex-1 min-w-0">
													<p className="text-sm font-medium truncate">
														{member.name}
													</p>
													<p className="text-xs text-muted-foreground capitalize">
														{member.role}
													</p>
												</div>
											</div>
										))}
									</div>
								) : (
									<div className="text-center py-8">
										<Users className="h-8 w-8 text-muted-foreground/50 mx-auto mb-3" />
										<p className="text-sm text-muted-foreground mb-3">
											{t("sections.familyMembers.noMembers")}
										</p>
										<Button
											variant="outline"
											size="sm"
											onClick={() => setIsFamilyDialogOpen(true)}
											className="gap-2"
										>
											<Settings className="h-3.5 w-3.5" />
											{t("actions.addMembers")}
										</Button>
									</div>
								)}
							</div>
						</Card>
						<Card>
							<div className="border-b px-6 py-4 flex items-center justify-between">
								<h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-2">
									<Vault className="h-4 w-4" />
									{t("vault.title")}
								</h2>
								<Button
									variant="ghost"
									size="sm"
									onClick={() => router.navigate({ to: "/documents" })}
									className="gap-2 h-8"
								>
									<Settings className="h-3.5 w-3.5" />
									{t("actions.manageDocuments")}
								</Button>
							</div>
						</Card>
					</div>
				</div>
			</main>

			{/* {t("sections.familyMembers.title")} Dialog */}
			<FamilyMembersDialog
				open={isFamilyDialogOpen}
				onOpenChange={setIsFamilyDialogOpen}
			/>
		</div>
	);
}
