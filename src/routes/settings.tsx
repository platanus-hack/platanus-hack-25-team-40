import { createFileRoute, redirect } from "@tanstack/react-router";
import Settings from "@/pages/settings";
import { supabase } from "@/shared/utils/supabase";
import { ensureProfileExists } from "@/shared/utils/profile-utils";

export const Route = createFileRoute("/settings")({
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      throw redirect({
        to: "/login",
      });
    }

    // Ensure profile exists and check if complete
    const isComplete = await ensureProfileExists(data.session.user.id);
    
    if (!isComplete) {
      throw redirect({
        to: "/complete-profile",
      });
    }
  },
  component: Settings,
});
