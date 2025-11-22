import { createFileRoute, redirect } from "@tanstack/react-router";
import Dashboard from "@/pages/dashboard";
import { supabase } from "@/shared/utils/supabase";

export const Route = createFileRoute("/dashboard")({
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      throw redirect({
        to: "/login",
      });
    }
  },
  component: Dashboard,
});
