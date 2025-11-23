import "react-i18next";
import type common from "./locales/en/common.json";
import type auth from "./locales/en/auth.json";
import type dashboard from "./locales/en/dashboard.json";
import type profile from "./locales/en/profile.json";
import type onboarding from "./locales/en/onboarding.json";
import type settings from "./locales/en/settings.json";
import type healthRecords from "./locales/en/health-records.json";
import type family from "./locales/en/family.json";
import type suggestions from "./locales/en/suggestions.json";

declare module "react-i18next" {
	interface CustomTypeOptions {
		defaultNS: "common";
		resources: {
			common: typeof common;
			auth: typeof auth;
			dashboard: typeof dashboard;
			profile: typeof profile;
			onboarding: typeof onboarding;
			settings: typeof settings;
			healthRecords: typeof healthRecords;
			family: typeof family;
			suggestions: typeof suggestions;
		};
	}
}
