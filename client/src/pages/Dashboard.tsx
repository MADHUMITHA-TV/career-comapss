import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { FileSearch, Target, TrendingUp, Clock, ArrowRight, Plus } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import type { JobAnalysis } from "@shared/schema";
import { useAuth } from "@/contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";

function StatCard({
  title,
  value,
  description,
  icon: Icon,
}: {
  title: string;
  value: string | number;
  description: string;
  icon: typeof FileSearch;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="font-display text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

function AnalysisCard({ analysis }: { analysis: JobAnalysis }) {
  const matchLevel =
    analysis.matchScore >= 8 ? "Strong" : analysis.matchScore >= 6 ? "Good" : "Needs Work";
  const matchColor =
    analysis.matchScore >= 8
      ? "text-green-600 dark:text-green-400"
      : analysis.matchScore >= 6
        ? "text-yellow-600 dark:text-yellow-400"
        : "text-red-600 dark:text-red-400";

  return (
    <Card className="hover-elevate cursor-pointer transition-all">
      <Link href={`/gaps?id=${analysis.id}`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 overflow-hidden">
              <CardTitle className="truncate text-base" data-testid={`text-job-title-${analysis.id}`}>
                {analysis.jobTitle || "Job Analysis"}
              </CardTitle>
              {analysis.companyName && (
                <CardDescription className="truncate">
                  {analysis.companyName}
                </CardDescription>
              )}
            </div>
            <Badge variant="secondary" className="shrink-0">
              {matchLevel}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Match Score</span>
              <span className={`font-display text-lg font-bold ${matchColor}`} data-testid={`text-score-${analysis.id}`}>
                {analysis.matchScore}/10
              </span>
            </div>
            <Progress value={analysis.matchScore * 10} className="h-2" />
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>
                {formatDistanceToNow(new Date(analysis.createdAt), { addSuffix: true })}
              </span>
            </div>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}

function EmptyState() {
  return (
    <Card className="col-span-full">
      <CardContent className="flex flex-col items-center justify-center py-12">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <FileSearch className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="mb-2 font-display text-lg font-semibold">No analyses yet</h3>
        <p className="mb-6 max-w-sm text-center text-sm text-muted-foreground">
          Start by analyzing your first job description to see how well your resume matches.
        </p>
        <Button asChild data-testid="button-first-analysis">
          <Link href="/analyze">
            <Plus className="mr-2 h-4 w-4" />
            New Analysis
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function LoadingSkeleton() {
  return (
    <>
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardHeader className="pb-3">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="mt-1 h-4 w-1/2" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-6 w-12" />
              </div>
              <Skeleton className="h-2 w-full" />
              <Skeleton className="h-3 w-24" />
            </div>
          </CardContent>
        </Card>
      ))}
    </>
  );
}

export default function Dashboard() {
  const { user } = useAuth();

  const { data: analyses, isLoading } = useQuery<JobAnalysis[]>({
    queryKey: ["/api/history"],
  });

  const totalAnalyses = analyses?.length || 0;
  const avgScore =
    analyses && analyses.length > 0
      ? Math.round(analyses.reduce((sum, a) => sum + a.matchScore, 0) / analyses.length)
      : 0;
  const recentAnalyses = analyses?.slice(0, 6) || [];

  return (
    <div className="space-y-8 p-6 md:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight" data-testid="text-welcome">
            Welcome back, {user?.name?.split(" ")[0] || "there"}!
          </h1>
          <p className="text-muted-foreground">
            Here's an overview of your career analysis journey.
          </p>
        </div>
        <Button asChild data-testid="button-new-analysis">
          <Link href="/analyze">
            <Plus className="mr-2 h-4 w-4" />
            New Analysis
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Total Analyses"
          value={totalAnalyses}
          description="Job descriptions analyzed"
          icon={FileSearch}
        />
        <StatCard
          title="Average Score"
          value={avgScore > 0 ? `${avgScore}/10` : "--"}
          description="Across all analyses"
          icon={TrendingUp}
        />
        <StatCard
          title="Skills to Improve"
          value={
            analyses
              ? analyses.reduce(
                  (sum, a) => sum + (a.gapAnalysis as any)?.missingSkills?.length || 0,
                  0
                )
              : "--"
          }
          description="Identified skill gaps"
          icon={Target}
        />
      </div>

      <div>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold">Recent Analyses</h2>
          {totalAnalyses > 6 && (
            <Button variant="ghost" size="sm" asChild>
              <Link href="/history">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading ? (
            <LoadingSkeleton />
          ) : recentAnalyses.length > 0 ? (
            recentAnalyses.map((analysis) => (
              <AnalysisCard key={analysis.id} analysis={analysis} />
            ))
          ) : (
            <EmptyState />
          )}
        </div>
      </div>
    </div>
  );
}
