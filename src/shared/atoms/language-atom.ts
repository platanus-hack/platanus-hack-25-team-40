import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import type { SupportedLanguage } from "../i18n";
import { SUPPORTED_LANGUAGES } from "../i18n";

/**
 * Atom for storing user's language preference
 * "system" means use browser language detection
 * Persists to localStorage as 'oregon-health-language'
 */
export const languageAtom = atomWithStorage<SupportedLanguage | "system">(
	"oregon-health-language",
	"system"
);

/**
 * Derived atom to get available languages from i18n config
 * Adds "system" option for browser language detection
 */
export const availableLanguagesAtom = atom(() => {
	const systemOption = {
		code: "system",
		name: "System",
		nativeName: "System",
	} as const;
	const languages = Object.entries(SUPPORTED_LANGUAGES).map(
		([code, { name, nativeName }]) => ({
			code: code as SupportedLanguage,
			name,
			nativeName,
		})
	);

	return [systemOption, ...languages] as const;
});
