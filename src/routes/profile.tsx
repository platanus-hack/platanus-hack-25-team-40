import { createFileRoute } from "@tanstack/react-router";
import Profile from "@/pages/profile";
import { requireAuthAndCompleteProfile } from "@/shared/utils/route-guards";

export const Route = createFileRoute("/profile")({
  beforeLoad: requireAuthAndCompleteProfile,
  component: Profile,
});
