import { createFileRoute } from "@tanstack/react-router";
import CompleteProfile from "@/pages/complete-profile";
import { requireAuth } from "@/shared/utils/route-guards";

export const Route = createFileRoute("/complete-profile")({
  beforeLoad: requireAuth,
  component: CompleteProfile,
});
