import { useEffect } from "react";
import { useAtom } from "jotai";
import { useTranslation } from "react-i18next";
import { languageAtom } from "@/shared/atoms/language-atom";
import { detectBrowserLanguage } from "@/shared/i18n";

/**
 * Component to sync language preference between Jotai atom and i18next
 * Ensures that language changes are persisted and synchronized across the app
 */
export function LanguageSync({ children }: { children: React.ReactNode }) {
	const [languagePreference, setLanguagePreference] = useAtom(languageAtom);
	const { i18n } = useTranslation();

	useEffect(() => {
		const targetLang =
			languagePreference === "system"
				? detectBrowserLanguage()
				: languagePreference;

		if (i18n.language !== targetLang) {
			i18n.changeLanguage(targetLang);
		}
	}, [languagePreference, i18n]);

	useEffect(() => {
		const handleLanguageChange = (lng: string) => {
			if (languagePreference !== "system" && lng !== languagePreference) {
				setLanguagePreference(lng as "en" | "es");
			}
		};

		i18n.on("languageChanged", handleLanguageChange);
		return () => {
			i18n.off("languageChanged", handleLanguageChange);
		};
	}, [i18n, languagePreference, setLanguagePreference]);

	return <>{children}</>;
}
