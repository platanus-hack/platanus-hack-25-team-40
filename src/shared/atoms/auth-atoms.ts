import { atom } from "jotai";
import type { Session } from "@supabase/supabase-js";

export type AuthLoadingState =
  | "idle"           // Initial state
  | "loading"        // Checking auth state
  | "authenticated"  // User is logged in
  | "unauthenticated"; // User is not logged in

export const sessionAtom = atom<Session | null>(null);
export const authLoadingStateAtom = atom<AuthLoadingState>("idle");
