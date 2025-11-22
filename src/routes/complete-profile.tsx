import { createFileRoute, redirect } from "@tanstack/react-router";
import CompleteProfile from "@/pages/complete-profile";
import { supabase } from "@/shared/utils/supabase";

export const Route = createFileRoute("/complete-profile")({
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      throw redirect({
        to: "/login",
      });
    }
  },
  component: CompleteProfile,
});
