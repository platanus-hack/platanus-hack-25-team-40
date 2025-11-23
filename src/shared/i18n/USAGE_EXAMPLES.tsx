/**
 * TRANSLATION USAGE EXAMPLES
 * Quick reference for using i18next in Oregon Health components
 */

import { useTranslation } from "react-i18next";
import { Button } from "@/shared/ui/button";

// ============================================
// EXAMPLE 1: Basic Usage (Single Namespace)
// ============================================
export function BasicExample() {
  const { t } = useTranslation("dashboard");
  
  return (
    <div>
      <h1>{t("title")}</h1>
      <p>{t("description")}</p>
    </div>
  );
}

// ============================================
// EXAMPLE 2: Multiple Namespaces
// ============================================
export function MultipleNamespacesExample() {
  const { t } = useTranslation(["profile", "common"]);
  
  return (
    <div>
      <h1>{t("title")}</h1>
      <Button>{t("common:actions.save")}</Button>
      <Button>{t("common:actions.cancel")}</Button>
    </div>
  );
}

// ============================================
// EXAMPLE 3: Nested Keys
// ============================================
export function NestedKeysExample() {
  const { t } = useTranslation("profile");
  
  return (
    <form>
      <label>{t("sections.demographics.fields.firstName")}</label>
      <label>{t("sections.demographics.fields.lastName")}</label>
      <label>{t("sections.demographics.fields.dateOfBirth")}</label>
    </form>
  );
}

// ============================================
// EXAMPLE 4: Interpolation (Dynamic Values)
// ============================================
export function InterpolationExample({ userName, recordCount }: { userName: string, recordCount: number }) {
  const { t } = useTranslation("dashboard");
  
  return (
    <div>
      {/* Assuming translations exist like: */}
      {/* "welcome": "Welcome, {{name}}!" */}
      {/* "recordCount": "You have {{count}} records" */}
      <h1>{t("welcome", { name: userName })}</h1>
      <p>{t("recordCount", { count: recordCount })}</p>
    </div>
  );
}

// ============================================
// EXAMPLE 5: Array Access for Lists
// ============================================
export function ArrayAccessExample() {
  const { t } = useTranslation("settings");
  
  return (
    <ul>
      {/* Accessing array items from JSON */}
      <li>{t("deleteDialog.items.0")}</li>
      <li>{t("deleteDialog.items.1")}</li>
      <li>{t("deleteDialog.items.2")}</li>
      <li>{t("deleteDialog.items.3")}</li>
    </ul>
  );
}

// ============================================
// EXAMPLE 6: Programmatic Language Change
// ============================================
export function LanguageChangeExample() {
  const { i18n } = useTranslation();
  
  const changeToSpanish = () => {
    i18n.changeLanguage("es");
  };
  
  const changeToEnglish = () => {
    i18n.changeLanguage("en");
  };
  
  return (
    <div>
      <Button onClick={changeToEnglish}>English</Button>
      <Button onClick={changeToSpanish}>Español</Button>
    </div>
  );
}

// ============================================
// EXAMPLE 7: Get Current Language
// ============================================
export function CurrentLanguageExample() {
  const { i18n } = useTranslation();
  
  const currentLanguage = i18n.language; // "en" or "es"
  const isSpanish = currentLanguage === "es";
  
  return (
    <div>
      <p>Current language: {currentLanguage}</p>
      {isSpanish && <p>¡Hola! Estás viendo la versión en español.</p>}
    </div>
  );
}

// ============================================
// EXAMPLE 8: Conditional Translations
// ============================================
export function ConditionalExample({ hasError }: { hasError: boolean }) {
  const { t } = useTranslation(["common"]);
  
  return (
    <div>
      {hasError ? (
        <p className="text-red-500">{t("errors.general")}</p>
      ) : (
        <p className="text-green-500">{t("messages.success")}</p>
      )}
    </div>
  );
}

// ============================================
// EXAMPLE 9: Form Validation Messages
// ============================================
export function ValidationExample() {
  const { t } = useTranslation("profile");
  
  const validateForm = (data: any) => {
    const errors: Record<string, string> = {};
    
    if (!data.firstName) {
      errors.firstName = t("sections.demographics.fields.firstName") + " " + t("common:errors.requiredField");
    }
    
    return errors;
  };
  
  return <form>{/* Form fields */}</form>;
}

// ============================================
// EXAMPLE 10: Loading States with Translations
// ============================================
export function LoadingStateExample({ isLoading, isSaving }: { isLoading: boolean, isSaving: boolean }) {
  const { t } = useTranslation("common");
  
  if (isLoading) {
    return <div>{t("actions.loading")}</div>;
  }
  
  return (
    <Button disabled={isSaving}>
      {isSaving ? t("actions.saving") : t("actions.save")}
    </Button>
  );
}

// ============================================
// TRANSLATION KEY REFERENCE
// ============================================

/*
NAMESPACES:
- common: Shared translations (navigation, actions, errors, messages)
- auth: Login/signup pages
- dashboard: Dashboard page
- profile: Profile page
- onboarding: Complete profile page
- settings: Settings page
- healthRecords: Health records module
- family: Family members module
- suggestions: AI suggestions

COMMON KEYS:
- t("common:navigation.dashboard")
- t("common:navigation.profile")
- t("common:navigation.settings")
- t("common:actions.save")
- t("common:actions.cancel")
- t("common:actions.edit")
- t("common:actions.delete")
- t("common:errors.general")
- t("common:messages.success")

NESTED KEY EXAMPLES:
- t("profile:sections.demographics.title")
- t("profile:sections.demographics.fields.firstName")
- t("settings:sections.accountInfo.email")
- t("dashboard:cards.myProfile.title")
*/
