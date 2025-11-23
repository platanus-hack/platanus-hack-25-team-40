import { useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import { Heart } from "lucide-react";
import { useUpsertProfile } from "@/modules/profile/hooks/use-profile-mutations";

export default function CompleteProfile() {
	const { t } = useTranslation(["onboarding", "common"]);
	const router = useRouter();
	const { mutate: upsertProfile, isPending } = useUpsertProfile();
	const [error, setError] = useState<string | null>(null);

	const [name, setName] = useState("");
	const [lastName, setLastName] = useState("");
	const [birthDate, setBirthDate] = useState("");
	const [biologicalSex, setBiologicalSex] = useState("");
	const [bloodType, setBloodType] = useState("");
	const [heightCm, setHeightCm] = useState("");
	const [weightKg, setWeightKg] = useState("");

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);

		upsertProfile(
			{
				name: name,
				last_name: lastName,
				birth_date: birthDate,
				biological_sex: biologicalSex,
				blood_type: bloodType || null,
				height_cm: heightCm ? parseInt(heightCm) : null,
				weight_kg: weightKg ? parseFloat(weightKg) : null,
				is_complete: true,
			},
			{
				onSuccess: () => {
					router.navigate({ to: "/dashboard" });
				},
				onError: (err) => {
					console.error("Profile upsert error:", err);
					setError(
						err instanceof Error ? err.message : "An unexpected error occurred."
					);
				},
			}
		);
	};

	return (
		<div className="min-h-screen bg-background flex items-center justify-center p-4">
			<Card className="w-full max-w-2xl p-8">
				<div className="flex items-center justify-center gap-2 mb-6">
					<Heart className="h-8 w-8 text-primary" />
					<span className="text-2xl font-bold">Oregon Health</span>
				</div>

				<div className="space-y-2 text-center mb-8">
					<h2 className="text-3xl font-bold tracking-tight">
						{t("onboarding.title")}
					</h2>
					<p className="text-muted-foreground">{t("onboarding.description")}</p>
				</div>

				<form onSubmit={handleSubmit} className="space-y-6">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="space-y-2">
							<label htmlFor="name" className="text-sm font-medium">
								{t("onboarding.fields.firstName")}{" "}
								<span className="text-destructive">*</span>
							</label>
							<input
								id="name"
								type="text"
								value={name}
								onChange={(e) => setName(e.target.value)}
								required
								className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
								placeholder={t("onboarding.placeholders.firstName")}
							/>
						</div>

						<div className="space-y-2">
							<label htmlFor="lastName" className="text-sm font-medium">
								{t("onboarding.fields.lastName")}{" "}
								<span className="text-destructive">*</span>
							</label>
							<input
								id="lastName"
								type="text"
								value={lastName}
								onChange={(e) => setLastName(e.target.value)}
								required
								className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
								placeholder={t("onboarding.placeholders.lastName")}
							/>
						</div>

						<div className="space-y-2">
							<label htmlFor="birthDate" className="text-sm font-medium">
								{t("onboarding.fields.dateOfBirth")}{" "}
								<span className="text-destructive">*</span>
							</label>
							<input
								id="birthDate"
								type="date"
								value={birthDate}
								onChange={(e) => setBirthDate(e.target.value)}
								required
								max={new Date().toISOString().split("T")[0]}
								className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
							/>
						</div>

						<div className="space-y-2">
							<label htmlFor="biologicalSex" className="text-sm font-medium">
								{t("onboarding.fields.biologicalSex")}{" "}
								<span className="text-destructive">*</span>
							</label>
							<select
								id="biologicalSex"
								value={biologicalSex}
								onChange={(e) => setBiologicalSex(e.target.value)}
								required
								className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
							>
								<option value="">{t("onboarding.selectOptions.select")}</option>
								<option value="male">
									{t("onboarding.selectOptions.male")}
								</option>
								<option value="female">
									{t("onboarding.selectOptions.female")}
								</option>
								<option value="other">
									{t("onboarding.selectOptions.other")}
								</option>
							</select>
						</div>

						<div className="space-y-2">
							<label htmlFor="bloodType" className="text-sm font-medium">
								{t("onboarding.fields.bloodType")}
							</label>
							<select
								id="bloodType"
								value={bloodType}
								onChange={(e) => setBloodType(e.target.value)}
								className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
							>
								<option value="">{t("onboarding.selectOptions.select")}</option>
								<option value="A+">A+</option>
								<option value="A-">A-</option>
								<option value="B+">B+</option>
								<option value="B-">B-</option>
								<option value="AB+">AB+</option>
								<option value="AB-">AB-</option>
								<option value="O+">O+</option>
								<option value="O-">O-</option>
							</select>
						</div>

						<div className="space-y-2">
							<label htmlFor="heightCm" className="text-sm font-medium">
								{t("onboarding.fields.height")}
							</label>
							<input
								id="heightCm"
								type="number"
								value={heightCm}
								onChange={(e) => setHeightCm(e.target.value)}
								min="50"
								max="300"
								className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
								placeholder={t("onboarding.placeholders.height")}
							/>
						</div>

						<div className="space-y-2 md:col-span-2">
							<label htmlFor="weightKg" className="text-sm font-medium">
								{t("onboarding.fields.weight")}
							</label>
							<input
								id="weightKg"
								type="number"
								value={weightKg}
								onChange={(e) => setWeightKg(e.target.value)}
								min="1"
								max="500"
								step="0.1"
								className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
								placeholder={t("onboarding.placeholders.weight")}
							/>
						</div>
					</div>

					{error && (
						<div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
							{error}
						</div>
					)}

					<div className="flex gap-4">
						<Button
							type="submit"
							className="flex-1"
							size="lg"
							disabled={isPending}
						>
							{isPending ? t("common.actions.saving") : t("onboarding.button")}
						</Button>
					</div>

					<p className="text-center text-xs text-muted-foreground">
						{t("onboarding.requiredNote")}
					</p>
				</form>
			</Card>
		</div>
	);
}
