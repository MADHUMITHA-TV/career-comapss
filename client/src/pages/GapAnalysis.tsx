import { Link, useSearch } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Target, CheckCircle, AlertCircle, ArrowLeft, Lightbulb, FileSearch } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import type { JobAnalysis, GapAnalysis as GapAnalysisType } from "@shared/schema";

function SkillCard({
  skill,
  type,
  index,
}: {
  skill: string;
  type: "matched" | "missing";
  index: number;
}) {
  const isMatched = type === "matched";
  return (
    <Card
      className={`${isMatched ? "border-green-200 dark:border-green-900" : "border-red-200 dark:border-red-900"}`}
      data-testid={`skill-card-${type}-${index}`}
    >
      <CardContent className="flex items-center gap-3 p-4">
        {isMatched ? (
          <CheckCircle className="h-5 w-5 shrink-0 text-green-600 dark:text-green-400" />
        ) : (
          <AlertCircle className="h-5 w-5 shrink-0 text-red-600 dark:text-red-400" />
        )}
        <span className="font-medium">{skill}</span>
      </CardContent>
    </Card>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10 rounded-lg" />
        <div className="flex-1">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="mt-1 h-4 w-32" />
        </div>
      </div>
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <Skeleton className="mx-auto h-4 w-24" />
            <Skeleton className="mx-auto mt-2 h-12 w-20" />
            <Skeleton className="mx-auto mt-4 h-3 w-full" />
          </div>
        </CardContent>
      </Card>
      <div className="grid gap-4 md:grid-cols-2">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton className="h-5 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <Card className="col-span-full">
      <CardContent className="flex flex-col items-center justify-center py-12">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <Target className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="mb-2 font-display text-lg font-semibold">No Analysis Selected</h3>
        <p className="mb-6 max-w-sm text-center text-sm text-muted-foreground">
          Select an analysis from your history or create a new one to view the detailed gap analysis.
        </p>
        <div className="flex gap-3">
          <Button asChild data-testid="button-new-analysis">
            <Link href="/analyze">New Analysis</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/history">View History</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function GapAnalysis() {
  const searchParams = useSearch();
  const params = new URLSearchParams(searchParams);
  const analysisId = params.get("id");

  const { data: analyses, isLoading } = useQuery<JobAnalysis[]>({
    queryKey: ["/api/history"],
  });

  const analysis = analyses?.find((a) => a.id === analysisId);
  const latestAnalysis = analyses?.[0];
  const displayAnalysis = analysis || latestAnalysis;

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl p-6 md:p-8">
        <LoadingSkeleton />
      </div>
    );
  }

  if (!displayAnalysis) {
    return (
      <div className="mx-auto max-w-4xl p-6 md:p-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold tracking-tight">Gap Analysis</h1>
          <p className="text-muted-foreground">
            Detailed breakdown of your skills compared to job requirements.
          </p>
        </div>
        <EmptyState />
      </div>
    );
  }

  const gapAnalysis = displayAnalysis.gapAnalysis as GapAnalysisType;
  const matchPercentage = displayAnalysis.matchScore * 10;

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-6 md:p-8">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight" data-testid="text-job-title">
              {displayAnalysis.jobTitle || "Job Analysis"}
            </h1>
            {displayAnalysis.companyName && (
              <p className="text-muted-foreground" data-testid="text-company">
                {displayAnalysis.companyName}
              </p>
            )}
          </div>
        </div>
        <Button variant="outline" asChild>
          <Link href="/analyze">
            <FileSearch className="mr-2 h-4 w-4" />
            New Analysis
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <span className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
              Overall Match
            </span>
            <div className="mt-2 font-display text-5xl font-bold text-primary" data-testid="text-score">
              {displayAnalysis.matchScore}/10
            </div>
            <Badge variant="secondary" className="mt-2">
              {matchPercentage}% Match
            </Badge>
          </div>
          <Progress value={matchPercentage} className="mt-6 h-3" />
          <div className="mt-4 flex justify-center gap-8 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
              <span>{gapAnalysis.matchedSkills.length} matched</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
              <span>{gapAnalysis.missingSkills.length} missing</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <div className="mb-4 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
            <h2 className="font-display text-xl font-semibold">Matched Skills</h2>
            <Badge variant="secondary" className="text-xs">
              {gapAnalysis.matchedSkills.length}
            </Badge>
          </div>
          <div className="space-y-3">
            {gapAnalysis.matchedSkills.length > 0 ? (
              gapAnalysis.matchedSkills.map((skill, i) => (
                <SkillCard key={i} skill={skill} type="matched" index={i} />
              ))
            ) : (
              <Card>
                <CardContent className="p-4 text-center text-sm text-muted-foreground">
                  No matched skills found. Consider updating your resume to highlight relevant
                  experience.
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <div>
          <div className="mb-4 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
            <h2 className="font-display text-xl font-semibold">Missing Skills</h2>
            <Badge variant="secondary" className="text-xs">
              {gapAnalysis.missingSkills.length}
            </Badge>
          </div>
          <div className="space-y-3">
            {gapAnalysis.missingSkills.length > 0 ? (
              gapAnalysis.missingSkills.map((skill, i) => (
                <SkillCard key={i} skill={skill} type="missing" index={i} />
              ))
            ) : (
              <Card>
                <CardContent className="p-4 text-center text-sm text-muted-foreground">
                  Great job! Your skills align well with this role's requirements.
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Recommendations
          </CardTitle>
          <CardDescription>Actionable tips to improve your application</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {(displayAnalysis.recommendations as string[]).map((rec, i) => (
              <div
                key={i}
                className="flex gap-4 rounded-lg border border-l-4 border-l-primary bg-card p-4"
                data-testid={`recommendation-${i}`}
              >
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
                  {i + 1}
                </div>
                <p className="text-sm">{rec}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
