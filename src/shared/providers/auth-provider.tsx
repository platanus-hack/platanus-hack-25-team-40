import { useEffect } from "react";
import { useSetAtom } from "jotai";
import { sessionAtom, authLoadingStateAtom } from "@/shared/atoms/auth-atoms";
import { supabase } from "@/shared/utils/supabase";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const setSession = useSetAtom(sessionAtom);
  const setAuthLoadingState = useSetAtom(authLoadingStateAtom);

  useEffect(() => {
    setAuthLoadingState("loading");

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state change:", event, session?.user?.id);

      setSession(session);
      
      if (session) {
        setAuthLoadingState("authenticated");
      } else {
        setAuthLoadingState("unauthenticated");
      }
    });

    return () => subscription.unsubscribe();
  }, [setSession, setAuthLoadingState]);

  return <>{children}</>;
}
