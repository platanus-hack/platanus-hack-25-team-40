import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/shared/ui/sheet";
import { Badge } from "@/shared/ui/badge";
import { Card } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { useHealthRecordsQuery } from "../hooks/use-health-records-query";
import type { HealthRecord } from "../types";
import {
	FileText,
	Calendar,
	Activity,
	ExternalLink,
	ChevronDown,
	ChevronUp,
	AlertCircle,
} from "lucide-react";

interface TimelineSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface GroupedRecords {
  [year: string]: {
    [month: string]: HealthRecord[];
  };
}

export function TimelineSheet({ open, onOpenChange }: TimelineSheetProps) {
  const { data: records, isLoading } = useHealthRecordsQuery();
  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(new Set());

  // Group records by year and month
  const groupedRecords: GroupedRecords = (records || []).reduce((acc, record) => {
    const date = new Date(record.date);
    const year = date.getFullYear().toString();
    const month = date.toLocaleString("default", { month: "long" });

    if (!acc[year]) {
      acc[year] = {};
    }
    if (!acc[year][month]) {
      acc[year][month] = [];
    }
    acc[year][month].push(record);
    return acc;
  }, {} as GroupedRecords);

  const toggleMonth = (yearMonth: string) => {
    setExpandedMonths((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(yearMonth)) {
        newSet.delete(yearMonth);
      } else {
        newSet.add(yearMonth);
      }
      return newSet;
    });
  };

  const getRecordTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      checkup: "bg-blue-100 text-blue-800 border-blue-200",
      diagnosis: "bg-red-100 text-red-800 border-red-200",
      prescription: "bg-green-100 text-green-800 border-green-200",
      "lab-result": "bg-purple-100 text-purple-800 border-purple-200",
      imaging: "bg-orange-100 text-orange-800 border-orange-200",
      vaccination: "bg-teal-100 text-teal-800 border-teal-200",
    };
    return colors[type] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const formatRecordType = (type: string) => {
		return type
			.split("-")
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
			.join(" ");
	};

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Health Timeline
          </SheetTitle>
          <SheetDescription>
            Chronological view of all health records
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-sm text-muted-foreground">Loading records...</p>
              </div>
            </div>
          ) : !records || records.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-2">No health records yet</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                Start by uploading your first medical document. Our AI will automatically
                organize and explain it for you.
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {Object.keys(groupedRecords)
                .sort((a, b) => parseInt(b) - parseInt(a))
                .map((year) => (
                  <div key={year} className="space-y-4">
                    {/* Year Header */}
                    <div className="sticky top-0 bg-background z-10 py-2">
                      <h3 className="text-2xl font-bold text-primary">{year}</h3>
                      <div className="h-1 w-12 bg-primary rounded-full mt-1"></div>
                    </div>

                    {/* Months */}
                    {Object.keys(groupedRecords[year])
                      .sort((a, b) => {
                        const monthOrder = [
                          "January",
                          "February",
                          "March",
                          "April",
                          "May",
                          "June",
                          "July",
                          "August",
                          "September",
                          "October",
                          "November",
                          "December",
                        ];
                        return monthOrder.indexOf(b) - monthOrder.indexOf(a);
                      })
                      .map((month) => {
                        const monthKey = `${year}-${month}`;
                        const isExpanded = expandedMonths.has(monthKey);
                        const monthRecords = groupedRecords[year][month];

                        return (
													<div key={monthKey} className="space-y-3">
														{/* Month Header */}
														<button
															onClick={() => toggleMonth(monthKey)}
															className="flex items-center justify-between w-full text-left p-3 rounded-lg hover:bg-accent transition-colors"
														>
															<div className="flex items-center gap-3">
																<Calendar className="h-5 w-5 text-muted-foreground" />
																<span className="font-semibold">{month}</span>
																<Badge variant="secondary" className="text-xs">
																	{monthRecords.length} record
																	{monthRecords.length !== 1 ? "s" : ""}
																</Badge>
															</div>
															{isExpanded ? (
																<ChevronUp className="h-4 w-4" />
															) : (
																<ChevronDown className="h-4 w-4" />
															)}
														</button>

														{/* Records for this month */}
														{isExpanded && (
															<div className="space-y-3 pl-4 border-l-2 border-muted ml-2">
																{monthRecords
																	.sort(
																		(a, b) =>
																			new Date(b.date).getTime() -
																			new Date(a.date).getTime()
																	)
																	.map((record) => (
																		<Card
																			key={record.id}
																			className="p-4 ml-4 hover:shadow-md transition-shadow"
																		>
																			<div className="space-y-3">
																				{/* Header */}
																				<div className="flex items-start justify-between">
																					<div className="flex-1">
																						<div className="flex items-center gap-2 mb-1">
																							<Badge
																								variant="outline"
																								className={getRecordTypeColor(
																									record.type
																								)}
																							>
																								{formatRecordType(record.type)}
																							</Badge>
																						</div>
																						<h4 className="font-semibold text-base">
																							{record.title}
																						</h4>
																						<p className="text-sm text-muted-foreground flex items-center gap-1">
																							<Calendar className="h-3 w-3" />
																							{formatDate(record.date)}
																							{record.specialty &&
																								record.specialty.trim() && (
																									<>
																										<span className="mx-1">
																											•
																										</span>
																										{record.specialty}
																									</>
																								)}
																						</p>
																					</div>
																				</div>

																				{/* Description */}
																				{record.description &&
																					record.description.trim() && (
																						<p className="text-sm text-muted-foreground line-clamp-3">
																							{record.description}
																						</p>
																					)}

																				{/* AI Interpretation */}
																				{record.aiInterpretation && (
																					<div className="bg-blue-50 border border-blue-200 rounded-md p-3">
																						<div className="flex items-start gap-2">
																							<AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
																							<div className="text-sm">
																								<p className="font-medium text-blue-900 mb-1">
																									AI Summary
																								</p>
																								<p className="text-blue-800">
																									{record.aiInterpretation
																										.summary ||
																										"Analysis available"}
																								</p>
																							</div>
																						</div>
																					</div>
																				)}

																				{/* File Link */}
																				{record.fileUrl && (
																					<div className="flex items-center gap-2 pt-2 border-t">
																						<Button
																							variant="outline"
																							size="sm"
																							className="gap-2"
																							onClick={() =>
																								window.open(
																									record.fileUrl!,
																									"_blank"
																								)
																							}
																						>
																							<ExternalLink className="h-3 w-3" />
																							View Document
																						</Button>
																					</div>
																				)}
																			</div>
																		</Card>
																	))}
															</div>
														)}
													</div>
												);
                      })}
                  </div>
                ))}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
