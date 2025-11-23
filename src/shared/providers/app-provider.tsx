import { Provider } from "jotai";
import { useHydrateAtoms } from "jotai/react/utils";
import { queryClientAtom } from "jotai-tanstack-query";
import { AuthProvider } from "./auth-provider";
import { LanguageSync } from "./language-sync";
import "@/shared/i18n"; // Initialize i18n

// QueryClient is defined in query-client.ts to satisfy fast refresh lint rule
import { queryClient } from "./query-client";

// Hydrate the queryClientAtom with the QueryClient instance
const HydrateAtoms = ({ children }: { children: React.ReactNode }) => {
	useHydrateAtoms([[queryClientAtom, queryClient]]);
	return children;
};

// Main App Provider Props
export interface AppProviderProps { children: React.ReactNode }

// Main App Provider
export function AppProvider({ children }: AppProviderProps) {
	return (
		<Provider>
			<HydrateAtoms>
				<LanguageSync>
					<AuthProvider>{children}</AuthProvider>
				</LanguageSync>
			</HydrateAtoms>
		</Provider>
	);
}
