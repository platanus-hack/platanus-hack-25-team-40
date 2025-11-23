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
	HeartIcon,
	Stars,
	Image,
	FileTextIcon,
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
import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import { detectBrowserLanguage } from "@/shared/i18n";

function App() {
	const { t, i18n } = useTranslation(["landing", "common"]);
	const [language, setLanguage] = useAtom(languageAtom);
	const availableLanguages = useAtomValue(availableLanguagesAtom);

	// Sync language changes to i18next
	useEffect(() => {
		const targetLang =
			language === "system" ? detectBrowserLanguage() : language;
		if (i18n.language !== targetLang) {
			i18n.changeLanguage(targetLang);
		}
	}, [language, i18n]);

	return (
		<div className="min-h-screen bg-background">
			{/* Oregon Icon - Top Left */}
			<div className="absolute top-4 left-4 z-4">
				<img src="/oregon.svg" alt="Oregon Health" className="h-14 w-14" />
			</div>



			{/* Language Selector - Top Right */}
			<div className="absolute top-4 right-4 z-10">
				<Select
					value={language}
					onValueChange={(value) =>
						setLanguage(value as "en" | "es" | "system")
					}
				>
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
							{t("landing:badge")}
						</Badge>
						<h1 className="mb-6 text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
							{t("landing:hero.title")}
							<br />
							<span className="bg-gradient-to-b from-[#E6A85C] via-[#D9803F] to-[#D06B36] bg-clip-text text-transparent">
								{t("landing:hero.subtitle")}
							</span>
						</h1>
						<p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground sm:text-xl">
							{t("landing:hero.description")}
						</p>
						<div className="flex flex-wrap justify-center gap-4">
							<Link to="/login">
								<Button size="lg" className="gap-2">
									{t("landing:hero.cta.start")}{" "}
									<ArrowRight className="h-4 w-4" />
								</Button>
							</Link>
							<Button size="lg" variant="outline">
								{t("landing:hero.cta.demo")}
							</Button>
						</div>
					</div>
				</div>
			</section>

			{/* The Problem */}
			<section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
				<div className="text-center mb-16">
					<Badge className="mb-4 bg-[#D06B36] hover:bg-[#D06B36]/90 border-transparent text-white">
						{t("landing:problem.badge")}
					</Badge>
					<h2 className="text-4xl font-bold tracking-tight mb-4">
						{t("landing:problem.title")}
					</h2>
					<p className="text-xl text-muted-foreground max-w-3xl mx-auto">
						{t("landing:problem.description")}
					</p>
				</div>

				<div className="grid gap-8 md:grid-cols-3">
					<Card className="border-[#D06B36]/20">
						<CardHeader>
							<FileText className="h-10 w-10 text-[#D06B36] mb-2" />
							<CardTitle>
								{t("landing:problem.cards.fragmented.title")}
							</CardTitle>
						</CardHeader>
						<CardContent>
							<CardDescription>
								{t("landing:problem.cards.fragmented.description")}
							</CardDescription>
						</CardContent>
					</Card>

					<Card className="border-[#D06B36]/20">
						<CardHeader>
							<Shield className="h-10 w-10 text-[#D06B36] mb-2" />
							<CardTitle>{t("landing:problem.cards.jargon.title")}</CardTitle>
						</CardHeader>
						<CardContent>
							<CardDescription>
								{t("landing:problem.cards.jargon.description")}
							</CardDescription>
						</CardContent>
					</Card>

					<Card className="border-[#D06B36]/20">
						<CardHeader>
							<Users className="h-10 w-10 text-[#D06B36] mb-2" />
							<CardTitle>{t("landing:problem.cards.context.title")}</CardTitle>
						</CardHeader>
						<CardContent>
							<CardDescription>
								{t("landing:problem.cards.context.description")}
							</CardDescription>
						</CardContent>
					</Card>
				</div>
			</section>

			{/* The Solution */}
			<section className="border-y bg-muted/30">
				<div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
					<div className="text-center mb-16">
						<Badge className="mb-4">{t("landing:solution.badge")}</Badge>
						<h2 className="text-4xl font-bold tracking-tight mb-4">
							{t("landing:solution.title")}
						</h2>
						<p className="text-xl text-muted-foreground max-w-3xl mx-auto">
							{t("landing:solution.description")}
						</p>
					</div>

					<div className="grid gap-8 lg:grid-cols-2 items-center">
						<div className="space-y-6">
							<div className="flex gap-4">
								<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
									<Database className="h-5 w-5" />
								</div>
								<div>
									<h3 className="font-semibold mb-2">
										{t("landing:solution.steps.upload.title")}
									</h3>
									<p className="text-muted-foreground">
										{t("landing:solution.steps.upload.description")}
									</p>
								</div>
							</div>

							<div className="flex gap-4">
								<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
									<Sparkles className="h-5 w-5" />
								</div>
								<div>
									<h3 className="font-semibold mb-2">
										{t("landing:solution.steps.translate.title")}
									</h3>
									<p className="text-muted-foreground">
										{t("landing:solution.steps.translate.description")}
									</p>
								</div>
							</div>

							<div className="flex gap-4">
								<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
									<Heart className="h-5 w-5" />
								</div>
								<div>
									<h3 className="font-semibold mb-2">
										<span className="bg-gradient-to-b from-[#E6A85C] via-[#D9803F] to-[#D06B36] bg-clip-text text-transparent">
											{t("landing:solution.steps.insights.title")}
										</span>
									</h3>
									<p className="text-muted-foreground">
										{t("landing:solution.steps.insights.description")}
									</p>
								</div>
							</div>
						</div>

						<Card className="bg-card">
							<CardHeader>
								<div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
									<span className="font-mono">
										{t("landing:solution.before")}
									</span>
									<ArrowRight className="h-4 w-4" />
									<span className="font-mono text-primary">
										{t("landing:solution.after")}
									</span>
								</div>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="rounded-lg border p-4 bg-muted/50">
									<p className="text-sm text-muted-foreground line-through flex items-center gap-2">
										<FileText className="h-4 w-4" />
										<span>Scan_001.pdf</span>
									</p>
									<p className="text-sm text-muted-foreground line-through flex items-center gap-2">
										<Image className="h-4 w-4" />
										<span>IMG_4523.jpg</span>
									</p>
									<p className="text-sm text-muted-foreground line-through flex items-center gap-2">
										<FileText className="h-4 w-4" />
										<span>WhatsApp Image 2024.pdf</span>
									</p>
								</div>
								<Stars className="h-5 w-5 mx-auto text-primary" />
								<div className="rounded-lg border p-4 bg-primary/5">
									<div className="space-y-2">
										<div className="flex items-center gap-2">
											<HeartIcon className="text-xs w-4 h-4">
												Cardiology
											</HeartIcon>
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
						{t("landing:features.title")}
					</h2>
				</div>

				<div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
					<Card>
						<CardHeader>
							<Badge className="w-fit mb-2">
								{t("landing:features.cards.vault.badge")}
							</Badge>
							<CardTitle>{t("landing:features.cards.vault.title")}</CardTitle>
						</CardHeader>
						<CardContent>
							<CardDescription>
								{t("landing:features.cards.vault.description")}
							</CardDescription>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<Badge className="w-fit mb-2">
								{t("landing:features.cards.translator.badge")}
							</Badge>
							<CardTitle>
								{t("landing:features.cards.translator.title")}
							</CardTitle>
						</CardHeader>
						<CardContent>
							<CardDescription>
								{t("landing:features.cards.translator.description")}
							</CardDescription>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<Badge className="w-fit mb-2">
								{t("landing:features.cards.family.badge")}
							</Badge>
							<CardTitle>{t("landing:features.cards.family.title")}</CardTitle>
						</CardHeader>
						<CardContent>
							<CardDescription>
								{t("landing:features.cards.family.description")}
							</CardDescription>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<Badge className="w-fit mb-2">
								{t("landing:features.cards.privacy.badge")}
							</Badge>
							<CardTitle>{t("landing:features.cards.privacy.title")}</CardTitle>
						</CardHeader>
						<CardContent>
							<CardDescription>
								{t("landing:features.cards.privacy.description")}
							</CardDescription>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<Badge className="w-fit mb-2">
								{t("landing:features.cards.timeline.badge")}
							</Badge>
							<CardTitle>
								{t("landing:features.cards.timeline.title")}
							</CardTitle>
						</CardHeader>
						<CardContent>
							<CardDescription>
								{t("landing:features.cards.timeline.description")}
							</CardDescription>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<Badge className="w-fit mb-2">
								{t("landing:features.cards.ai.badge")}
							</Badge>
							<CardTitle>{t("landing:features.cards.ai.title")}</CardTitle>
						</CardHeader>
						<CardContent>
							<CardDescription>
								{t("landing:features.cards.ai.description")}
							</CardDescription>
						</CardContent>
					</Card>
				</div>
			</section>


			{/* Footer */}
			<footer className="border-t">
				<div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
					<p className="text-center text-sm text-muted-foreground">
						{t("landing:footer.subtitle")}
					</p>
				</div>
			</footer>
		</div>
	);
}

export default App;
