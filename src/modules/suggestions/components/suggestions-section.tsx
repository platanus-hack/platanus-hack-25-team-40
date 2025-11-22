import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { useSuggestionsQuery } from "../hooks/use-suggestions-query";
import { SuggestionCard } from "./suggestion-card";
import { Brain, Loader2 } from "lucide-react";
import type { Suggestion } from "../types";

const urgencyOrder: Suggestion["urgencyLevel"][] = ["critical", "high", "medium", "low"];

function groupSuggestionsByUrgency(suggestions: Suggestion[]) {
  const grouped: Record<string, Suggestion[]> = {
    critical: [],
    high: [],
    medium: [],
    low: [],
    unknown: [],
  };

  suggestions.forEach((suggestion) => {
    const level = suggestion.urgencyLevel || "unknown";
    if (level in grouped) {
      grouped[level].push(suggestion);
    } else {
      grouped.unknown.push(suggestion);
    }
  });

  return grouped;
}

export function SuggestionsSection() {
  const suggestionsQuery = useSuggestionsQuery();
  const suggestions = suggestionsQuery.data || [];

  if (suggestionsQuery.isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Health Insights
          </CardTitle>
          <CardDescription>
            Personalized suggestions based on your health records and family history
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (suggestions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Health Insights
          </CardTitle>
          <CardDescription>
            Personalized suggestions based on your health records and family history
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Brain className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">No suggestions yet</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              Suggestions will appear here as you add health records and family members.
              Our AI analyzes your data to provide personalized health insights.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const grouped = groupSuggestionsByUrgency(suggestions);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          AI Health Insights
        </CardTitle>
        <CardDescription>
          {suggestions.length} personalized suggestion{suggestions.length !== 1 ? "s" : ""} based on your health records and family history
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {urgencyOrder.map((level) => {
            const levelSuggestions = grouped[level];
            if (levelSuggestions.length === 0) return null;

            return (
              <div key={level} className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  {level === "critical" && "🚨 Critical Priority"}
                  {level === "high" && "⚠️ High Priority"}
                  {level === "medium" && "📋 Medium Priority"}
                  {level === "low" && "💡 Low Priority"}
                </h3>
                <div className="space-y-3">
                  {levelSuggestions.map((suggestion) => (
                    <SuggestionCard key={suggestion.id} suggestion={suggestion} />
                  ))}
                </div>
              </div>
            );
          })}
          {grouped.unknown.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Other Suggestions
              </h3>
              <div className="space-y-3">
                {grouped.unknown.map((suggestion) => (
                  <SuggestionCard key={suggestion.id} suggestion={suggestion} />
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

