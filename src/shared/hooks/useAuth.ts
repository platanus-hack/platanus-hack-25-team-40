import { useAtomValue } from "jotai";
import { sessionAtom, authLoadingStateAtom } from "@/shared/atoms/auth-atoms";
import { supabase } from "@/shared/utils/supabase";

export const useSession = () => useAtomValue(sessionAtom);
export const useAuthLoadingState = () => useAtomValue(authLoadingStateAtom);

export const useUser = () => {
  const session = useSession();
  return session?.user ?? null;
};

// Get the current site URL (works in both dev and production)
const getSiteUrl = () => {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return 'http://localhost:5173'; // Fallback for SSR
};

export async function signInWithEmail(email: string, password: string) {
  return await supabase.auth.signInWithPassword({ email, password });
}

export async function signUpWithEmail(email: string, password: string) {
  return await supabase.auth.signUp({ 
    email, 
    password,
    options: {
      emailRedirectTo: getSiteUrl(),
    }
  });
}

export async function signOut() {
  return await supabase.auth.signOut();
}

export async function resetPassword(email: string) {
  return await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: getSiteUrl(),
  });
}
