import { Link } from "@tanstack/react-router";
import { Button } from "@/shared/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import {
	FileText,
	Users,
	Shield,
	Sparkles,
	ArrowRight,
	Heart,
	Database,
	Zap,
	Languages,
} from "lucide-react";
import { useAtom, useAtomValue } from "jotai";
import { languageAtom, availableLanguagesAtom } from "@/shared/atoms/language-atom";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/shared/ui/select";

function App() {
	const [language, setLanguage] = useAtom(languageAtom);
	const availableLanguages = useAtomValue(availableLanguagesAtom);
	
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
			{/* Hero Section */}
			<section className="relative overflow-hidden border-b">
				<div className="absolute inset-0 bg-linear-to-br from-primary/5 via-background to-accent/5" />
				<div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
					<div className="text-center">
						<Badge className="mb-4" variant="secondary">
							<Sparkles className="mr-1 h-3 w-3" />
							Legacy Track × Consumer AI Track
						</Badge>
						<h1 className="mb-6 text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
							The First Family
							<br />
							<span className="bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent">
								Health OS
							</span>
						</h1>
						<p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground sm:text-xl">
							Medical records are the last great un-digitized legacy. We
							transform fragmented paper trails into an intelligent family
							health timeline—powered by AI that understands, translates, and
							protects.
						</p>
						<div className="flex flex-wrap justify-center gap-4">
							<Link to="/login">
								<Button size="lg" className="gap-2">
									Start Your Family Vault <ArrowRight className="h-4 w-4" />
								</Button>
							</Link>
							<Button size="lg" variant="outline">
								Watch Demo
							</Button>
						</div>
					</div>
				</div>
			</section>

			{/* The Problem */}
			<section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
				<div className="text-center mb-16">
					<Badge variant="destructive" className="mb-4">
						The Legacy Problem
					</Badge>
					<h2 className="text-4xl font-bold tracking-tight mb-4">
						Your Family's Health History is Lost
					</h2>
					<p className="text-xl text-muted-foreground max-w-3xl mx-auto">
						My dad has cancer. His medical history is scattered across 5
						hospitals, 20 PDFs, and WhatsApp chats. It's fragmented, illegible,
						and useless when we need it most.
					</p>
				</div>

				<div className="grid gap-8 md:grid-cols-3">
					<Card className="border-destructive/20">
						<CardHeader>
							<FileText className="h-10 w-10 text-destructive mb-2" />
							<CardTitle>Fragmented Records</CardTitle>
						</CardHeader>
						<CardContent>
							<CardDescription>
								Paper reports, photos, PDFs across multiple providers. No single
								source of truth.
							</CardDescription>
						</CardContent>
					</Card>

					<Card className="border-destructive/20">
						<CardHeader>
							<Shield className="h-10 w-10 text-destructive mb-2" />
							<CardTitle>Medical Jargon</CardTitle>
						</CardHeader>
						<CardContent>
							<CardDescription>
								Dense terminology that creates anxiety instead of clarity for
								families.
							</CardDescription>
						</CardContent>
					</Card>

					<Card className="border-destructive/20">
						<CardHeader>
							<Users className="h-10 w-10 text-destructive mb-2" />
							<CardTitle>No Family Context</CardTitle>
						</CardHeader>
						<CardContent>
							<CardDescription>
								Hereditary patterns ignored. Your parent's diagnosis could
								prevent yours.
							</CardDescription>
						</CardContent>
					</Card>
				</div>
			</section>

			{/* The Solution */}
			<section className="border-y bg-muted/30">
				<div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
					<div className="text-center mb-16">
						<Badge className="mb-4">The Solution</Badge>
						<h2 className="text-4xl font-bold tracking-tight mb-4">
							Not Just Storage. Intelligence.
						</h2>
						<p className="text-xl text-muted-foreground max-w-3xl mx-auto">
							We use Multimodal AI to ingest messy legacy documents—photos of
							paper, PDFs, handwritten notes—and restructure them into a unified
							digital timeline.
						</p>
					</div>

					<div className="grid gap-8 lg:grid-cols-2 items-center">
						<div className="space-y-6">
							<div className="flex gap-4">
								<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
									<Database className="h-5 w-5" />
								</div>
								<div>
									<h3 className="font-semibold mb-2">1. Drop & Forget</h3>
									<p className="text-muted-foreground">
										Upload messy PDFs, photos, scans. AI automatically
										categorizes (Cardiology, Blood Work, Oncology), extracts
										dates, and tags doctors.
									</p>
								</div>
							</div>

							<div className="flex gap-4">
								<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
									<Sparkles className="h-5 w-5" />
								</div>
								<div>
									<h3 className="font-semibold mb-2">
										2. Medical-to-Human Translation
									</h3>
									<p className="text-muted-foreground">
										Dense medical PDF on the left. Clear explanation on the
										right: "This is a standard metabolic panel. Everything looks
										normal, except your Vitamin D is low."
									</p>
								</div>
							</div>

							<div className="flex gap-4">
								<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
									<Heart className="h-5 w-5" />
								</div>
								<div>
									<h3 className="font-semibold mb-2">3. Family Intelligence</h3>
									<p className="text-muted-foreground">
										Dad's high cholesterol triggers a gentle preventive reminder
										for you. Because health isn't individual—it's hereditary.
									</p>
								</div>
							</div>
						</div>

						<Card className="bg-card">
							<CardHeader>
								<div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
									<span className="font-mono">Before</span>
									<ArrowRight className="h-4 w-4" />
									<span className="font-mono text-primary">After</span>
								</div>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="rounded-lg border p-4 bg-muted/50">
									<p className="text-sm text-muted-foreground line-through">
										Scan_001.pdf
									</p>
									<p className="text-sm text-muted-foreground line-through">
										IMG_4523.jpg
									</p>
									<p className="text-sm text-muted-foreground line-through">
										WhatsApp Image 2024.pdf
									</p>
								</div>
								<Zap className="h-6 w-6 mx-auto text-primary" />
								<div className="rounded-lg border p-4 bg-primary/5">
									<div className="space-y-2">
										<div className="flex items-center gap-2">
											<Badge variant="secondary" className="text-xs">
												Cardiology
											</Badge>
											<span className="text-sm font-medium">
												Checkup • Dr. House
											</span>
										</div>
										<p className="text-xs text-muted-foreground">
											Nov 21, 2024
										</p>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>
				</div>
			</section>

			{/* Key Features */}
			<section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
				<div className="text-center mb-16">
					<h2 className="text-4xl font-bold tracking-tight mb-4">
						Built for Families, Powered by AI
					</h2>
				</div>

				<div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
					<Card>
						<CardHeader>
							<Badge className="w-fit mb-2">Smart Vault</Badge>
							<CardTitle>Active Database</CardTitle>
						</CardHeader>
						<CardContent>
							<CardDescription>
								Not a dumb folder—an intelligent system that learns your
								family's health patterns over time.
							</CardDescription>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<Badge className="w-fit mb-2">Translator</Badge>
							<CardTitle>Turn Anxiety into Clarity</CardTitle>
						</CardHeader>
						<CardContent>
							<CardDescription>
								Split-screen interface: medical document left, plain-English
								explanation right. Instant peace of mind.
							</CardDescription>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<Badge className="w-fit mb-2">Family Link</Badge>
							<CardTitle>Hereditary Intelligence</CardTitle>
						</CardHeader>
						<CardContent>
							<CardDescription>
								Soft notifications for hereditary patterns. Prevention, not
								diagnosis. Logic, not fear.
							</CardDescription>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<Badge className="w-fit mb-2">Privacy First</Badge>
							<CardTitle>Your Data, Your Control</CardTitle>
						</CardHeader>
						<CardContent>
							<CardDescription>
								End-to-end encryption. HIPAA-compliant. Share on your terms with
								family or providers.
							</CardDescription>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<Badge className="w-fit mb-2">Timeline View</Badge>
							<CardTitle>Your Health Story</CardTitle>
						</CardHeader>
						<CardContent>
							<CardDescription>
								Chronological visualization of every test, diagnosis, and
								treatment across all family members.
							</CardDescription>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<Badge className="w-fit mb-2">Multimodal AI</Badge>
							<CardTitle>Understands Everything</CardTitle>
						</CardHeader>
						<CardContent>
							<CardDescription>
								Photos, handwriting, PDFs, lab results. If it's health-related,
								we can parse it.
							</CardDescription>
						</CardContent>
					</Card>
				</div>
			</section>

			{/* CTA Section */}
			<section className="border-t bg-primary text-primary-foreground">
				<div className="mx-auto max-w-7xl px-4 py-24 text-center sm:px-6 lg:px-8">
					<h2 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl">
						Start Building Your Family's Health Legacy
					</h2>
					<p className="mx-auto mb-8 max-w-2xl text-lg opacity-90">
						Join families who are taking control of their health data. Free for
						your first vault. No credit card required.
					</p>
					<div className="flex flex-wrap justify-center gap-4">
						<Link to="/login">
							<Button size="lg" variant="secondary" className="gap-2">
								Get Started Free <ArrowRight className="h-4 w-4" />
							</Button>
						</Link>
						<Button
							size="lg"
							variant="outline"
							className="border-primary-foreground/20 bg-primary-foreground/10 hover:bg-primary-foreground/20"
						>
							Talk to Us
						</Button>
					</div>
				</div>
			</section>

			{/* Footer */}
			<footer className="border-t">
				<div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
					<p className="text-center text-sm text-muted-foreground">
						Built for the Legacy Track × Consumer AI Track
					</p>
				</div>
			</footer>
		</div>
	);
}

export default App;
