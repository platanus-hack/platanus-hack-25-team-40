import { createFileRoute } from "@tanstack/react-router";
import Settings from "@/pages/settings";
import { requireAuthAndCompleteProfile } from "@/shared/utils/route-guards";

export const Route = createFileRoute("/settings")({
  beforeLoad: requireAuthAndCompleteProfile,
  component: Settings,
});
