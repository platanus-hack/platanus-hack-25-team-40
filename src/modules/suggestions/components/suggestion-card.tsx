import { Card, CardHeader, CardTitle } from "@/shared/ui/card";
import { Badge, type BadgeProps } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { X, FileText, Stethoscope, Pill, Heart, Calendar } from "lucide-react";
import type { Suggestion } from "../types";
import { useDismissSuggestion } from "../hooks/use-suggestions-mutations";
import type { LucideIcon } from "lucide-react";

interface SuggestionCardProps {
  suggestion: Suggestion;
  onClick: () => void;
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

const categoryIcons: Record<
  NonNullable<Suggestion["category"]>,
  LucideIcon
> = {
  screening: Stethoscope,
  medication: Pill,
  lifestyle: Heart,
  follow_up: Calendar,
};

export function SuggestionCard({ suggestion, onClick }: SuggestionCardProps) {
  const { mutate: dismissSuggestion, isPending } = useDismissSuggestion();

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    dismissSuggestion({
      id: suggestion.id,
      isDismissed: true,
    });
  };

  const urgencyLevel = suggestion.urgencyLevel || "medium";
  const urgencyColor = urgencyColors[urgencyLevel] || "default";

  return (
    <Card
      className="relative cursor-pointer hover:shadow-md transition-shadow active:scale-[0.98]"
      onClick={onClick}
    >
      <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6 pt-4 sm:pt-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center flex-wrap gap-1.5 sm:gap-2 mb-2">
              {suggestion.urgencyLevel && (
                <Badge variant={urgencyColor} className="shrink-0 text-xs">
                  {urgencyLabels[suggestion.urgencyLevel]}
                </Badge>
              )}
              {suggestion.category && (
                <Badge variant="outline" className="shrink-0 text-xs">
                  {categoryLabels[suggestion.category]}
                </Badge>
              )}
              {suggestion.acknowledgedAt && (
                <Badge variant="secondary" className="text-xs shrink-0">
                  Acknowledged
                </Badge>
              )}
            </div>
            <CardTitle className="text-sm sm:text-base leading-snug mb-2 flex items-center gap-2">
              {suggestion.category && (() => {
                const Icon = categoryIcons[suggestion.category];
                return Icon ? (
                  <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground shrink-0" />
                ) : null;
              })()}
              <span>{suggestion.title}</span>
            </CardTitle>
            {suggestion.sourceRecords.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {suggestion.sourceRecords.slice(0, 2).map((source) => (
                  <Badge
                    key={`${suggestion.id}-${source.recordId ?? source.label}`}
                    variant="secondary"
                    className="text-xs flex items-center gap-1"
                  >
                    <FileText className="h-3 w-3" />
                    {source.label}
                  </Badge>
                ))}
                {suggestion.sourceRecords.length > 2 && (
                  <Badge variant="secondary" className="text-xs">
                    +{suggestion.sourceRecords.length - 2} more
                  </Badge>
                )}
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0 self-end sm:self-start sm:-mt-1"
            onClick={handleDismiss}
            disabled={isPending}
            aria-label="Dismiss suggestion"
          >
            <X className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
          </Button>
        </div>
      </CardHeader>
    </Card>
  );
}

