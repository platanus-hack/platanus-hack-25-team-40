import { supabase } from "@/shared/utils/supabase";
import { useRouter } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import { Heart } from "lucide-react";

export default function CompleteProfile() {
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [userId, setUserId] = useState<string | null>(null);
	
	const [name, setName] = useState("");
	const [lastName, setLastName] = useState("");
	const [birthDate, setBirthDate] = useState("");
	const [biologicalSex, setBiologicalSex] = useState("");
	const [bloodType, setBloodType] = useState("");
	const [heightCm, setHeightCm] = useState("");
	const [weightKg, setWeightKg] = useState("");

	useEffect(() => {
		supabase.auth.getSession().then(async ({ data: { session } }) => {
			if (!session) {
				router.navigate({ to: "/login" });
			} else {
				setUserId(session.user.id);
				
				// Check if profile exists, if not create a basic one
				const { error: profileError } = await supabase
					.from('patient_profiles')
					.select('id')
					.eq('user_id', session.user.id)
					.single();
				
				if (profileError && profileError.code === 'PGRST116') {
					// No profile found, create one
					console.log('No profile found, creating basic profile...');
					const { error: insertError } = await supabase
						.from('patient_profiles')
						.insert({
							user_id: session.user.id,
							name: session.user.user_metadata?.name || '',
							last_name: session.user.user_metadata?.last_name || '',
							birth_date: new Date().toISOString().split('T')[0],
							biological_sex: 'not_specified',
							is_complete: false
						});
					
					if (insertError) {
						console.error('Error creating profile:', insertError);
						// Don't set error state here - let user try to submit the form
						// The form submission will handle creating/updating the profile
					}
				}
			}
		});
	}, [router]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!userId) return;

		setLoading(true);
		setError(null);

		try {
			// Use upsert to handle both create and update cases
			const { error: upsertError } = await supabase
				.from('patient_profiles')
				.upsert({
					user_id: userId,
					name: name,
					last_name: lastName,
					birth_date: birthDate,
					biological_sex: biologicalSex,
					blood_type: bloodType || null,
					height_cm: heightCm ? parseInt(heightCm) : null,
					weight_kg: weightKg ? parseFloat(weightKg) : null,
					is_complete: true,
				}, {
					onConflict: 'user_id'
				});

			if (upsertError) {
				console.error("Profile upsert error:", upsertError);
				setError(upsertError.message);
				setLoading(false);
			} else {
				router.navigate({ to: "/dashboard" });
			}
		} catch (err) {
			console.error("Unexpected error:", err);
			setError("An unexpected error occurred.");
			setLoading(false);
		}
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
						Complete Your Profile
					</h2>
					<p className="text-muted-foreground">
						Help us personalize your health experience with a few more details
					</p>
				</div>

				<form onSubmit={handleSubmit} className="space-y-6">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="space-y-2">
							<label htmlFor="name" className="text-sm font-medium">
								First Name <span className="text-destructive">*</span>
							</label>
							<input
								id="name"
								type="text"
								value={name}
								onChange={(e) => setName(e.target.value)}
								required
								className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
								placeholder="John"
							/>
						</div>

						<div className="space-y-2">
							<label htmlFor="lastName" className="text-sm font-medium">
								Last Name <span className="text-destructive">*</span>
							</label>
							<input
								id="lastName"
								type="text"
								value={lastName}
								onChange={(e) => setLastName(e.target.value)}
								required
								className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
								placeholder="Doe"
							/>
						</div>

						<div className="space-y-2">
							<label htmlFor="birthDate" className="text-sm font-medium">
								Date of Birth <span className="text-destructive">*</span>
							</label>
							<input
								id="birthDate"
								type="date"
								value={birthDate}
								onChange={(e) => setBirthDate(e.target.value)}
								required
								max={new Date().toISOString().split('T')[0]}
								className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
							/>
						</div>

						<div className="space-y-2">
							<label htmlFor="biologicalSex" className="text-sm font-medium">
								Biological Sex <span className="text-destructive">*</span>
							</label>
							<select
								id="biologicalSex"
								value={biologicalSex}
								onChange={(e) => setBiologicalSex(e.target.value)}
								required
								className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
							>
								<option value="">Select...</option>
								<option value="male">Male</option>
								<option value="female">Female</option>
								<option value="other">Other</option>
							</select>
						</div>

						<div className="space-y-2">
							<label htmlFor="bloodType" className="text-sm font-medium">
								Blood Type
							</label>
							<select
								id="bloodType"
								value={bloodType}
								onChange={(e) => setBloodType(e.target.value)}
								className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
							>
								<option value="">Select...</option>
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
								Height (cm)
							</label>
							<input
								id="heightCm"
								type="number"
								value={heightCm}
								onChange={(e) => setHeightCm(e.target.value)}
								min="50"
								max="300"
								className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
								placeholder="170"
							/>
						</div>

						<div className="space-y-2 md:col-span-2">
							<label htmlFor="weightKg" className="text-sm font-medium">
								Weight (kg)
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
								placeholder="70.5"
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
							disabled={loading}
						>
							{loading ? "Saving..." : "Complete Profile"}
						</Button>
					</div>

					<p className="text-center text-xs text-muted-foreground">
						Fields marked with <span className="text-destructive">*</span> are required
					</p>
				</form>
			</Card>
		</div>
	);
}
