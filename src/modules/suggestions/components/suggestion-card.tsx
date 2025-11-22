import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Badge, type BadgeProps } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { X, Calendar, AlertCircle, Check } from "lucide-react";
import type { Suggestion } from "../types";
import { useAcknowledgeSuggestion, useDismissSuggestion } from "../hooks/use-suggestions-mutations";

interface SuggestionCardProps {
  suggestion: Suggestion;
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

export function SuggestionCard({ suggestion }: SuggestionCardProps) {
  const { mutate: dismissSuggestion, isPending } = useDismissSuggestion();
  const { mutate: acknowledgeSuggestion, isPending: isAcknowledging } = useAcknowledgeSuggestion();

  const handleDismiss = () => {
    dismissSuggestion({
      id: suggestion.id,
      isDismissed: true,
    });
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
    <Card className="relative">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <CardTitle className="text-lg">{suggestion.title}</CardTitle>
              {suggestion.urgencyLevel && (
                <Badge variant={urgencyColor}>
                  {urgencyLabels[suggestion.urgencyLevel]}
                </Badge>
              )}
              {suggestion.category && (
                <Badge variant="outline">
                  {categoryLabels[suggestion.category]}
                </Badge>
              )}
              {suggestion.acknowledgedAt && (
                <Badge variant="secondary" className="text-xs">
                  Acknowledged
                </Badge>
              )}
            </div>
            {suggestion.reason && (
              <CardDescription className="text-sm mt-1">
                {suggestion.reason}
              </CardDescription>
            )}
            {suggestion.sourceRecords.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {suggestion.sourceRecords.map((source) => (
                  <Badge key={`${suggestion.id}-${source.recordId ?? source.label}`} variant="secondary">
                    {source.label}
                  </Badge>
                ))}
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={handleDismiss}
            disabled={isPending}
            aria-label="Dismiss suggestion"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            {suggestion.validityEndDate && (
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>
                  Valid until {new Date(suggestion.validityEndDate).toLocaleDateString()}
                </span>
              </div>
            )}
            {suggestion.actionType && (
              <div className="flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                <span className="capitalize">
                  {suggestion.actionType.replace(/_/g, " ")}
                </span>
              </div>
            )}
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            {!suggestion.acknowledgedAt && (
              <Button
                size="sm"
                onClick={handleAcknowledge}
                disabled={isAcknowledging}
                className="flex items-center gap-1"
              >
                <Check className="h-4 w-4" />
                Acknowledge
              </Button>
            )}
            {suggestion.validityEndDate && (
              <Button
                size="sm"
                variant="secondary"
                onClick={handleSchedulePlaceholder}
                className="flex items-center gap-1"
              >
                <Calendar className="h-4 w-4" />
                Schedule
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

