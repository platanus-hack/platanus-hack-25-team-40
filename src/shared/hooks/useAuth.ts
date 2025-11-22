import { useAtomValue } from "jotai";
import { sessionAtom, authLoadingStateAtom } from "@/shared/atoms/auth-atoms";
import { supabase } from "@/shared/utils/supabase";

export const useSession = () => useAtomValue(sessionAtom);
export const useAuthLoadingState = () => useAtomValue(authLoadingStateAtom);

export const useUser = () => {
  const session = useSession();
  return session?.user ?? null;
};

export async function signInWithEmail(email: string, password: string) {
  return await supabase.auth.signInWithPassword({ email, password });
}

export async function signUpWithEmail(email: string, password: string) {
  return await supabase.auth.signUp({ email, password });
}

export async function signOut() {
  return await supabase.auth.signOut();
}

export async function resetPassword(email: string) {
  return await supabase.auth.resetPasswordForEmail(email);
}
