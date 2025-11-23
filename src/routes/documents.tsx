import { createFileRoute } from "@tanstack/react-router";
import { requireAuthAndCompleteProfile } from "@/shared/utils/route-guards";
import Documents from "@/pages/documents";

export const Route = createFileRoute("/documents")({
  beforeLoad: requireAuthAndCompleteProfile,
  component: Documents,
});
