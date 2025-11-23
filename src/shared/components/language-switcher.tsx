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

export function LanguageSwitcher() {
	const [language, setLanguage] = useAtom(languageAtom);
	const availableLanguages = useAtomValue(availableLanguagesAtom);
	const { t } = useTranslation("settings");

	return (
		<div className="space-y-2">
			<label className="text-sm font-medium">{t("sections.language.title")}</label>
			<p className="text-sm text-muted-foreground mb-2">
				{t("sections.language.description")}
			</p>
			<Select value={language} onValueChange={setLanguage}>
				<SelectTrigger className="w-full sm:w-60">
					<SelectValue placeholder={t("sections.language.select")} />
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
	);
}
