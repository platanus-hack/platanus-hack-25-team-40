import { supabase } from "@/shared/utils/supabase";
import { useRouter } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { Heart, FileText, Shield, Users, Languages } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { useTranslation } from "react-i18next";
import { useAtom, useAtomValue } from "jotai";
import { languageAtom, availableLanguagesAtom } from "@/shared/atoms/language-atom";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/shared/ui/select";

export default function Login() {
	const { t } = useTranslation(["auth", "common"]);
	const [language, setLanguage] = useAtom(languageAtom);
	const availableLanguages = useAtomValue(availableLanguagesAtom);
	const router = useRouter();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [isSignUp, setIsSignUp] = useState(false);
	const [emailSent, setEmailSent] = useState(false);

	const checkProfileAndRedirect = useCallback(
		async (userId: string) => {
			const { data: profileData, error: profileError } = await supabase
				.from("patient_profiles")
				.select("is_complete")
				.eq("user_id", userId)
				.single();

			// If profile doesn't exist, redirect to dashboard (profile will be created there)
			if (profileError && profileError.code === "PGRST116") {
				// No profile found - this shouldn't happen if signup worked correctly
				console.error(
					"No profile found for user, redirecting to complete profile"
				);
				router.navigate({ to: "/complete-profile" });
				return;
			}

			if (profileData && !profileData.is_complete) {
				router.navigate({ to: "/complete-profile" });
			} else {
				router.navigate({ to: "/dashboard" });
			}
		},
		[router]
	);

	useEffect(() => {
		supabase.auth.getSession().then(({ data: { session } }) => {
			if (session) {
				checkProfileAndRedirect(session.user.id);
			}
		});

		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange(async (event, session) => {
			if (event === "SIGNED_IN" && session) {
				await checkProfileAndRedirect(session.user.id);
			}
		});

		return () => subscription.unsubscribe();
	}, [router, checkProfileAndRedirect]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError(null);

		console.log("Attempting auth with:", { email, isSignUp });
		console.log("Supabase URL:", import.meta.env.VITE_SUPABASE_URL);

		try {
			const { data, error } = isSignUp
				? await supabase.auth.signUp({ email, password })
				: await supabase.auth.signInWithPassword({ email, password });

			console.log("Auth response:", { data, error });

			if (error) {
				console.error("Auth error:", error);
				setError(error.message);
				setLoading(false);
			} else if (isSignUp && data.user) {
				// Profile will be created on first login via complete-profile page
				setEmailSent(true);
				setLoading(false);
			}
		} catch (err) {
			console.error("Unexpected error:", err);
			setError("An unexpected error occurred. Check console for details.");
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-background">
			{/* Language Selector - Top Right */}
			<div className="absolute top-4 right-4 z-10">
				<Select value={language} onValueChange={(value) => setLanguage(value as "en" | "es" | "system")}>
					<SelectTrigger className="w-[140px] bg-background/95 backdrop-blur">
						<Languages className="h-4 w-4 mr-2" />
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						{availableLanguages.map((lang) => (
							<SelectItem key={lang.code} value={lang.code}>
								{lang.nativeName}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>
			<div className="flex min-h-screen">
				{/* Left Side - Branding */}
				<div className="hidden lg:flex lg:w-1/2 relative overflow-hidden border-r">
					<div className="absolute inset-0 bg-linear-to-br from-primary/5 via-background to-accent/5" />
					<div className="relative flex flex-col justify-between p-12 w-full">
						<div>
							<div className="flex items-center gap-2 mb-8">
								<Heart className="h-8 w-8 text-primary" />
								<span className="text-2xl font-bold">{t("common:app.name")}</span>
							</div>

							<Badge variant="secondary" className="mb-6">
								{t("badge")}
							</Badge>

							<h1 className="text-4xl font-bold tracking-tight mb-4">
								{t("heroTitle")}
								<br />
								<span className="bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent">
									{t("heroSubtitle")}
								</span>
							</h1>
							<p className="text-lg text-muted-foreground max-w-md">
								{t("heroDescription")}
							</p>
						</div>

						<div className="space-y-4">
							<div className="flex items-start gap-4">
								<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
									<FileText className="h-5 w-5 text-primary" />
								</div>
								<div>
									<h3 className="font-semibold mb-1">{t("features.organization.title")}</h3>
									<p className="text-sm text-muted-foreground">
										{t("features.organization.description")}
									</p>
								</div>
							</div>
							<div className="flex items-start gap-4">
								<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
									<Shield className="h-5 w-5 text-primary" />
								</div>
								<div>
									<h3 className="font-semibold mb-1">{t("features.privacy.title")}</h3>
									<p className="text-sm text-muted-foreground">
										{t("features.privacy.description")}
									</p>
								</div>
							</div>
							<div className="flex items-start gap-4">
								<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
									<Users className="h-5 w-5 text-primary" />
								</div>
								<div>
									<h3 className="font-semibold mb-1">{t("features.family.title")}</h3>
									<p className="text-sm text-muted-foreground">
										{t("features.family.description")}
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Right Side - Form */}
				<div className="flex-1 flex items-center justify-center p-8">
					<div className="w-full max-w-md space-y-8">
						<div className="flex lg:hidden items-center justify-center gap-2 mb-8">
							<Heart className="h-8 w-8 text-primary" />
							<span className="text-2xl font-bold">{t("common:app.name")}</span>
						</div>

						<div className="space-y-2 text-center lg:text-left">
							<h2 className="text-3xl font-bold tracking-tight">
								{isSignUp ? t("signUpTitle") : t("signInTitle")}
							</h2>
							<p className="text-muted-foreground">
								{isSignUp
									? t("signUpDescription")
									: t("signInDescription")}
							</p>
						</div>

						<form onSubmit={handleSubmit} className="space-y-6">
							{emailSent ? (
								<div className="space-y-6">
									<div className="rounded-lg border border-primary/50 bg-primary/10 px-6 py-8 text-center space-y-4">
										<div className="flex justify-center">
											<div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/20">
												<svg
													className="h-8 w-8 text-primary"
													fill="none"
													stroke="currentColor"
													viewBox="0 0 24 24"
												>
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														strokeWidth={2}
														d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
													/>
												</svg>
											</div>
										</div>
										<div>
											<h3 className="text-lg font-semibold mb-2">
												{t("emailConfirmation.title")}
											</h3>
											<p className="text-sm text-muted-foreground">
												{t("emailConfirmation.sentTo")}{" "}
												<strong>{email}</strong>
											</p>
											<p className="text-sm text-muted-foreground mt-2">
												{t("emailConfirmation.instructions")}
											</p>
										</div>
									</div>
									<Button
										type="button"
										variant="outline"
										className="w-full"
										onClick={() => {
											setEmailSent(false);
											setEmail("");
											setPassword("");
										}}
									>
										{t("emailConfirmation.backToSignUp")}
									</Button>
								</div>
							) : (
								<>
									<div className="space-y-4">
										<div className="space-y-2">
											<label htmlFor="email" className="text-sm font-medium">
												{t("email")}
											</label>
											<input
												id="email"
												type="email"
												value={email}
												onChange={(e) => setEmail(e.target.value)}
												required
												className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring placeholder:text-muted-foreground"
												placeholder={t("emailPlaceholder")}
											/>
										</div>
										<div className="space-y-2">
											<label htmlFor="password" className="text-sm font-medium">
												{t("password")}
											</label>
											<input
												id="password"
												type="password"
												value={password}
												onChange={(e) => setPassword(e.target.value)}
												required
												minLength={6}
												className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring placeholder:text-muted-foreground"
												placeholder="••••••••"
											/>
										</div>
									</div>

									{error && (
										<div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
											{error}
										</div>
									)}

									<Button
										type="submit"
										className="w-full"
										size="lg"
										disabled={loading}
									>
										{loading
											? t("loading")
											: isSignUp
											? t("createAccount")
											: t("signIn")}
									</Button>

									<div className="text-center">
										<button
											type="button"
											onClick={() => {
												setIsSignUp(!isSignUp);
												setError(null);
											}}
											className="text-sm text-muted-foreground hover:text-primary transition-colors"
										>
											{isSignUp
												? t("alreadyHaveAccount")
												: t("noAccount")}
										</button>
									</div>
								</>
							)}
						</form>

						<p className="text-center text-xs text-muted-foreground pt-4">
							{t("terms.agreement")}{" "}
							<a
								href="#"
								className="text-primary hover:underline underline-offset-4"
							>
								{t("terms.service")}
							</a>{" "}
							{t("terms.and")}{" "}
							<a
								href="#"
								className="text-primary hover:underline underline-offset-4"
							>
								{t("terms.privacy")}
							</a>
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
