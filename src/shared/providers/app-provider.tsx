import { QueryClient } from "@tanstack/react-query";
import { Provider } from "jotai";
import { useHydrateAtoms } from "jotai/react/utils";
import { queryClientAtom } from "jotai-tanstack-query";

// Create QueryClient instance
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 15 * 60 * 1000, // 15 minutes (formerly cacheTime)
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

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
        {children}
      </HydrateAtoms>
    </Provider>
  );
}
