import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import enCommon from "./locales/en/common.json";
import enAuth from "./locales/en/auth.json";
import enDashboard from "./locales/en/dashboard.json";
import enProfile from "./locales/en/profile.json";
import enOnboarding from "./locales/en/onboarding.json";
import enSettings from "./locales/en/settings.json";
import enHealthRecords from "./locales/en/health-records.json";
import enFamily from "./locales/en/family.json";
import enSuggestions from "./locales/en/suggestions.json";

import esCommon from "./locales/es/common.json";
import esAuth from "./locales/es/auth.json";
import esDashboard from "./locales/es/dashboard.json";
import esProfile from "./locales/es/profile.json";
import esOnboarding from "./locales/es/onboarding.json";
import esSettings from "./locales/es/settings.json";
import esHealthRecords from "./locales/es/health-records.json";
import esFamily from "./locales/es/family.json";
import esSuggestions from "./locales/es/suggestions.json";

export const SUPPORTED_LANGUAGES = {
	en: { name: "English", nativeName: "English" },
	es: { name: "Spanish", nativeName: "Español" },
} as const;

export type SupportedLanguage = keyof typeof SUPPORTED_LANGUAGES;

/**
 * Detect browser language and return a supported language
 * Falls back to 'en' if browser language is not supported
 */
export function detectBrowserLanguage(): SupportedLanguage {
	const browserLang = navigator.language.split("-")[0];
	return browserLang in SUPPORTED_LANGUAGES
		? (browserLang as SupportedLanguage)
		: "en";
}

i18n.use(initReactI18next).init({
	resources: {
		en: {
			common: enCommon,
			auth: enAuth,
			dashboard: enDashboard,
			profile: enProfile,
			onboarding: enOnboarding,
			settings: enSettings,
			healthRecords: enHealthRecords,
			family: enFamily,
			suggestions: enSuggestions,
		},
		es: {
			common: esCommon,
			auth: esAuth,
			dashboard: esDashboard,
			profile: esProfile,
			onboarding: esOnboarding,
			settings: esSettings,
			healthRecords: esHealthRecords,
			family: esFamily,
			suggestions: esSuggestions,
		},
	},
	lng: "en",
	fallbackLng: "en",
	defaultNS: "common",
	ns: [
		"common",
		"auth",
		"dashboard",
		"profile",
		"onboarding",
		"settings",
		"healthRecords",
		"family",
		"suggestions",
	],
	interpolation: {
		escapeValue: false,
	},
	react: {
		useSuspense: false,
	},
});

export default i18n;
