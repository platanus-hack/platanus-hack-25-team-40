import { QueryClient } from "@tanstack/react-query";
import { Provider } from "jotai";
import { useHydrateAtoms } from "jotai/react/utils";
import { queryClientAtom } from "jotai-tanstack-query";
import { AuthProvider } from "./auth-provider";

// Create QueryClient instance
export const queryClient = new QueryClient();

// Hydrate the queryClientAtom with the QueryClient instance
const HydrateAtoms = ({ children }: { children: React.ReactNode }) => {
  useHydrateAtoms([[queryClientAtom, queryClient]]);
  return children;
};

// Main App Provider Props
export interface AppProviderProps {
  children: React.ReactNode;
}

// Main App Provider
export function AppProvider({ children }: AppProviderProps) {
  return (
		<Provider>
			<HydrateAtoms>
				<AuthProvider>{children}</AuthProvider>
			</HydrateAtoms>
		</Provider>
	);
}
