import { createFileRoute } from "@tanstack/react-router";
import Dashboard from "@/pages/dashboard";
import { requireAuthAndCompleteProfile } from "@/shared/utils/route-guards";

export const Route = createFileRoute("/dashboard")({
	beforeLoad: requireAuthAndCompleteProfile,
	component: Dashboard,
});
