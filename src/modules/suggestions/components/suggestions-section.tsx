import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { useSuggestionsQuery } from "../hooks/use-suggestions-query";
import { SuggestionCard } from "./suggestion-card";
import { SuggestionDetailModal } from "./suggestion-detail-modal";
import { Brain, Loader2 } from "lucide-react";
import type { Suggestion } from "../types";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/shared/utils/supabase";
import { useQueryClient } from "@tanstack/react-query";
import { useUser } from "@/shared/hooks/useAuth";
import { useTranslation } from "react-i18next";

const urgencyOrder: Array<NonNullable<Suggestion["urgencyLevel"]>> = ["critical", "high", "medium", "low"];
const visibleCap = 6;

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
    if (level && level in grouped) {
      grouped[level].push(suggestion);
    } else {
      grouped.unknown.push(suggestion);
    }
  });

  return grouped;
}

function prioritizeSuggestions(suggestions: Suggestion[]) {
  const urgencyRank: Record<string, number> = {
    critical: 0,
    high: 1,
    medium: 2,
    low: 3,
  };

  return [...suggestions].sort((a, b) => {
    const ackDiff = Number(Boolean(a.acknowledgedAt)) - Number(Boolean(b.acknowledgedAt));
    if (ackDiff !== 0) return ackDiff;

    const urgencyDiff =
      (urgencyRank[a.urgencyLevel || "low"] ?? 3) - (urgencyRank[b.urgencyLevel || "low"] ?? 3);
    if (urgencyDiff !== 0) return urgencyDiff;

    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

export function SuggestionsSection() {
  const { t } = useTranslation("suggestions");
  const suggestionsQuery = useSuggestionsQuery();
  const suggestions = suggestionsQuery.data || [];
  const queryClient = useQueryClient();
  const user = useUser();
  const [showAll, setShowAll] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState<Suggestion | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Subscribe to realtime updates for all suggestion changes
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel("suggestions-changes")
      .on(
        "postgres_changes",
        {
          event: "*", // Listen to all events: INSERT, UPDATE, DELETE
          schema: "public",
          table: "suggestions",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log("Suggestion changed:", payload.eventType, payload);
          // Invalidate and refetch suggestions for any change
          queryClient.invalidateQueries({ queryKey: ["suggestions", user.id] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, queryClient]);

  const prioritized = useMemo(() => prioritizeSuggestions(suggestions), [suggestions]);
  const visibleSuggestions = showAll ? prioritized : prioritized.slice(0, visibleCap);
  const grouped = groupSuggestionsByUrgency(visibleSuggestions);

  if (suggestionsQuery.isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            {t("title")}
          </CardTitle>
          <CardDescription>
            {t("description")}
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
            {t("title")}
          </CardTitle>
          <CardDescription>
            {t("description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Brain className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">{t("noSuggestions")}</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              {t("noSuggestionsDescription")}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }


  return (
  <Card className="h-full">
      <CardHeader className="pb-4 px-4 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Brain className="h-5 w-5 shrink-0" />
              {t("title")}
            </CardTitle>
            <CardDescription className="mt-2 text-sm">
            {t("description")}
            </CardDescription>
          </div>
          {suggestions.length > visibleCap && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowAll((prev) => !prev)}
              className="shrink-0 self-start w-full sm:w-auto"
            >
              {showAll ? t("showFewer") : t("showAll")}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pb-5 sm:pb-6 px-4 sm:px-6">
        <div className="space-y-4 sm:space-y-6">
          {urgencyOrder.map((level) => {
            const levelSuggestions = grouped[level];
            if (levelSuggestions.length === 0) return null;

            return (
              <div key={level} className="space-y-2.5 sm:space-y-3">
                <h3 className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  {t(`priority.${level}`)}
                </h3>
                <div className="space-y-2.5 sm:space-y-3">
                  {levelSuggestions.map((suggestion: Suggestion) => (
                    <SuggestionCard
                      key={suggestion.id}
                      suggestion={suggestion}
                      onClick={() => {
                        setSelectedSuggestion(suggestion);
                        setIsModalOpen(true);
                      }}
                    />
                  ))}
                </div>
              </div>
            );
          })}
          {grouped.unknown.length > 0 && (
            <div className="space-y-2.5 sm:space-y-3">
              <h3 className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                {t("priority.other")}
              </h3>
              <div className="space-y-2.5 sm:space-y-3">
                {grouped.unknown.map((suggestion: Suggestion) => (
                  <SuggestionCard
                    key={suggestion.id}
                    suggestion={suggestion}
                    onClick={() => {
                      setSelectedSuggestion(suggestion);
                      setIsModalOpen(true);
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <SuggestionDetailModal
        suggestion={selectedSuggestion}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </Card>
  );
}

