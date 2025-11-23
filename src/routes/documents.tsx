import { createFileRoute } from "@tanstack/react-router";
import { requireAuthAndCompleteProfile } from "@/shared/utils/route-guards";
import Documents from "@/pages/documents";

// Add search param validation so we can deep-link to a specific document
export const Route = createFileRoute("/documents")({
  beforeLoad: requireAuthAndCompleteProfile,
  validateSearch: (search: Record<string, unknown>) => ({
    recordId: typeof search.recordId === "string" ? search.recordId : undefined,
  }),
  component: Documents,
});
