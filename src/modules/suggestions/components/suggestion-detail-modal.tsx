import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Badge, type BadgeProps } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Calendar, AlertCircle, Check } from "lucide-react";
import type { Suggestion } from "../types";
import { useAcknowledgeSuggestion, useDismissSuggestion } from "../hooks/use-suggestions-mutations";

interface SuggestionDetailModalProps {
  suggestion: Suggestion | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const urgencyColors: Record<
  NonNullable<Suggestion["urgencyLevel"]>,
  BadgeProps["variant"]
> = {
  critical: "destructive",
  high: "destructive",
  medium: "default",
  low: "secondary",
};

const urgencyLabels = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low",
} as const;

const categoryLabels = {
  screening: "Screening",
  medication: "Medication",
  lifestyle: "Lifestyle",
  follow_up: "Follow-up",
} as const;

export function SuggestionDetailModal({
  suggestion,
  open,
  onOpenChange,
}: SuggestionDetailModalProps) {
  const { mutate: dismissSuggestion, isPending } = useDismissSuggestion();
  const { mutate: acknowledgeSuggestion, isPending: isAcknowledging } = useAcknowledgeSuggestion();

  if (!suggestion) return null;

  const handleDismiss = () => {
    dismissSuggestion({
      id: suggestion.id,
      isDismissed: true,
    });
    onOpenChange(false);
  };

  const handleAcknowledge = () => {
    acknowledgeSuggestion({
      id: suggestion.id,
      acknowledgedAt: new Date().toISOString(),
    });
  };

  const handleSchedulePlaceholder = () => {
    if (typeof window !== "undefined") {
      window.alert("Calendar scheduling is coming soon.");
    }
  };

  const urgencyLevel = suggestion.urgencyLevel || "medium";
  const urgencyColor = urgencyColors[urgencyLevel] || "default";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
        <DialogHeader className="space-y-3 pr-8">
          <div className="flex items-center flex-wrap gap-1.5 sm:gap-2">
            {suggestion.urgencyLevel && (
              <Badge variant={urgencyColor} className="text-xs">
                {urgencyLabels[suggestion.urgencyLevel]}
              </Badge>
            )}
            {suggestion.category && (
              <Badge variant="outline" className="text-xs">
                {categoryLabels[suggestion.category]}
              </Badge>
            )}
            {suggestion.acknowledgedAt && (
              <Badge variant="secondary" className="text-xs">
                Acknowledged
              </Badge>
            )}
          </div>
          <DialogTitle className="text-xl sm:text-2xl leading-tight">
            {suggestion.title}
          </DialogTitle>
          {suggestion.reason && (
            <DialogDescription className="text-sm sm:text-base leading-relaxed pt-1">
              {suggestion.reason}
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="space-y-5 sm:space-y-6 mt-4 sm:mt-6">
          {/* Source Records */}
          {suggestion.sourceRecords.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-foreground">
                Associated Records
              </h4>
              <div className="flex flex-wrap gap-2">
                {suggestion.sourceRecords.map((source) => (
                  <Badge
                    key={`${suggestion.id}-${source.recordId ?? source.label}`}
                    variant="secondary"
                    className="text-sm py-1"
                  >
                    {source.label}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Action Items */}
          {(suggestion.validityEndDate || suggestion.actionType) && (
            <div className="space-y-3 py-4 border-y">
              {suggestion.validityEndDate && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-sm text-muted-foreground">
                    Valid until{" "}
                    {new Date(suggestion.validityEndDate).toLocaleDateString(
                      "en-US",
                      { month: "long", day: "numeric", year: "numeric" }
                    )}
                  </span>
                </div>
              )}
              {suggestion.actionType && (
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-sm text-muted-foreground capitalize">
                    {suggestion.actionType.replace(/_/g, " ")}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-3 pt-2">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 flex-1">
              {suggestion.validityEndDate && (
                <Button
                  variant="secondary"
                  onClick={handleSchedulePlaceholder}
                  className="gap-2 w-full sm:w-auto"
                >
                  <Calendar className="h-4 w-4" />
                  Schedule
                </Button>
              )}
              <Button
                variant="outline"
                onClick={handleDismiss}
                disabled={isPending}
                className="w-full sm:w-auto"
              >
                Dismiss
              </Button>
            </div>
            {!suggestion.acknowledgedAt && (
              <Button
                onClick={handleAcknowledge}
                disabled={isAcknowledging}
                className="gap-2 w-full sm:w-auto sm:ml-auto"
              >
                <Check className="h-4 w-4" />
                Acknowledge
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

