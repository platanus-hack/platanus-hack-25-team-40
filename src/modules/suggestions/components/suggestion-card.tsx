import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { X, Calendar, AlertCircle } from "lucide-react";
import type { Suggestion } from "../types";
import { useDismissSuggestion } from "../hooks/use-suggestions-mutations";

interface SuggestionCardProps {
  suggestion: Suggestion;
}

const urgencyColors = {
  critical: "destructive",
  high: "destructive",
  medium: "default",
  low: "secondary",
} as const;

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

  const handleDismiss = () => {
    dismissSuggestion({
      id: suggestion.id,
      isDismissed: true,
    });
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
                <Badge variant={urgencyColor as any}>
                  {urgencyLabels[suggestion.urgencyLevel]}
                </Badge>
              )}
              {suggestion.category && (
                <Badge variant="outline">
                  {categoryLabels[suggestion.category]}
                </Badge>
              )}
            </div>
            {suggestion.reason && (
              <CardDescription className="text-sm mt-1">
                {suggestion.reason}
              </CardDescription>
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
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
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
      </CardContent>
    </Card>
  );
}

