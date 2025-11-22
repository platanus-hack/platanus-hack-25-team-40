import { createFileRoute } from "@tanstack/react-router";
import CompleteProfile from "@/pages/complete-profile";

export const Route = createFileRoute("/complete-profile")({
  component: CompleteProfile,
});
