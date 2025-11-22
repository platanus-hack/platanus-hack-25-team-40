import { supabase } from "@/shared/utils/supabase";
import { useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Heart, FileText, Shield, Users } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";

export default function Login() {
	const router = useRouter();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [isSignUp, setIsSignUp] = useState(false);

	useEffect(() => {
		supabase.auth.getSession().then(({ data: { session } }) => {
			if (session) {
				router.navigate({ to: "/dashboard" });
			}
		});

		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((event, session) => {
			if (event === "SIGNED_IN" && session) {
				router.navigate({ to: "/dashboard" });
			}
		});

		return () => subscription.unsubscribe();
	}, [router]);

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
			} else if (isSignUp) {
				setError("Check your email to confirm your account!");
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
			<div className="flex min-h-screen">
				{/* Left Side - Branding */}
				<div className="hidden lg:flex lg:w-1/2 relative overflow-hidden border-r">
					<div className="absolute inset-0 bg-linear-to-br from-primary/5 via-background to-accent/5" />
					<div className="relative flex flex-col justify-between p-12 w-full">
						<div>
							<div className="flex items-center gap-2 mb-8">
								<Heart className="h-8 w-8 text-primary" />
								<span className="text-2xl font-bold">Oregon Health</span>
							</div>
							
							<Badge variant="secondary" className="mb-6">
								The First Family Health OS
							</Badge>

							<h1 className="text-4xl font-bold tracking-tight mb-4">
								Your Family's Health
								<br />
								<span className="bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent">
									In One Place
								</span>
							</h1>
							<p className="text-lg text-muted-foreground max-w-md">
								Transform fragmented medical records into an intelligent family health timeline—powered by AI that understands, translates, and protects.
							</p>
						</div>

						<div className="space-y-4">
							<div className="flex items-start gap-4">
								<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
									<FileText className="h-5 w-5 text-primary" />
								</div>
								<div>
									<h3 className="font-semibold mb-1">Smart Organization</h3>
									<p className="text-sm text-muted-foreground">
										AI automatically categorizes and structures all medical records
									</p>
								</div>
							</div>
							<div className="flex items-start gap-4">
								<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
									<Shield className="h-5 w-5 text-primary" />
								</div>
								<div>
									<h3 className="font-semibold mb-1">Privacy First</h3>
									<p className="text-sm text-muted-foreground">
										End-to-end encryption with HIPAA compliance
									</p>
								</div>
							</div>
							<div className="flex items-start gap-4">
								<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
									<Users className="h-5 w-5 text-primary" />
								</div>
								<div>
									<h3 className="font-semibold mb-1">Family Intelligence</h3>
									<p className="text-sm text-muted-foreground">
										Track hereditary patterns across your family tree
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
							<span className="text-2xl font-bold">Oregon Health</span>
						</div>

						<div className="space-y-2 text-center lg:text-left">
							<h2 className="text-3xl font-bold tracking-tight">
								{isSignUp ? "Create your account" : "Welcome back"}
							</h2>
							<p className="text-muted-foreground">
								{isSignUp 
									? "Start building your family health vault" 
									: "Sign in to access your family health records"}
							</p>
						</div>

						<form onSubmit={handleSubmit} className="space-y-6">
							<div className="space-y-4">
								<div className="space-y-2">
									<label
										htmlFor="email"
										className="text-sm font-medium"
									>
										Email
									</label>
									<input
										id="email"
										type="email"
										value={email}
										onChange={(e) => setEmail(e.target.value)}
										required
										className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring placeholder:text-muted-foreground"
										placeholder="you@example.com"
									/>
								</div>
								<div className="space-y-2">
									<label
										htmlFor="password"
										className="text-sm font-medium"
									>
										Password
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
								{loading ? "Loading..." : isSignUp ? "Create Account" : "Sign In"}
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
										? "Already have an account? Sign in"
										: "Don't have an account? Sign up"}
								</button>
							</div>
						</form>

						<p className="text-center text-xs text-muted-foreground pt-4">
							By continuing, you agree to our{" "}
							<a href="#" className="text-primary hover:underline underline-offset-4">
								Terms of Service
							</a>{" "}
							and{" "}
							<a href="#" className="text-primary hover:underline underline-offset-4">
								Privacy Policy
							</a>
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
