import { Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Clock, FileSearch, Trash2, ArrowRight, Target, Plus } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { JobAnalysis } from "@shared/schema";
import { format } from "date-fns";

function HistoryCard({ analysis }: { analysis: JobAnalysis }) {
  const { toast } = useToast();

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/history/${analysis.id}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/history"] });
      toast({
        title: "Analysis deleted",
        description: "The analysis has been removed from your history.",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete analysis. Please try again.",
      });
    },
  });

  const matchLevel =
    analysis.matchScore >= 8 ? "Strong" : analysis.matchScore >= 6 ? "Good" : "Needs Work";
  const matchColor =
    analysis.matchScore >= 8
      ? "text-green-600 dark:text-green-400"
      : analysis.matchScore >= 6
        ? "text-yellow-600 dark:text-yellow-400"
        : "text-red-600 dark:text-red-400";

  return (
    <Card className="group" data-testid={`history-card-${analysis.id}`}>
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0 pb-3">
        <div className="flex-1 overflow-hidden">
          <CardTitle className="truncate text-lg" data-testid={`text-title-${analysis.id}`}>
            {analysis.jobTitle || "Job Analysis"}
          </CardTitle>
          {analysis.companyName && (
            <CardDescription className="truncate">{analysis.companyName}</CardDescription>
          )}
        </div>
        <Badge variant="secondary">{matchLevel}</Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Match Score</span>
            <span className={`font-display text-lg font-bold ${matchColor}`} data-testid={`text-score-${analysis.id}`}>
              {analysis.matchScore}/10
            </span>
          </div>
          <Progress value={analysis.matchScore * 10} className="h-2" />
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Matched Skills</span>
            <p className="font-medium">
              {(analysis.gapAnalysis as any)?.matchedSkills?.length || 0}
            </p>
          </div>
          <div>
            <span className="text-muted-foreground">Missing Skills</span>
            <p className="font-medium">
              {(analysis.gapAnalysis as any)?.missingSkills?.length || 0}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>{format(new Date(analysis.createdAt), "MMM d, yyyy 'at' h:mm a")}</span>
        </div>

        <div className="flex gap-2 pt-2">
          <Button variant="outline" size="sm" className="flex-1" asChild>
            <Link href={`/gaps?id=${analysis.id}`}>
              <Target className="mr-2 h-4 w-4" />
              View Details
            </Link>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 text-muted-foreground"
                data-testid={`button-delete-${analysis.id}`}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Analysis?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete this job analysis. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => deleteMutation.mutate()}
                  className="bg-destructive text-destructive-foreground"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
}

function LoadingSkeleton() {
  return (
    <>
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Card key={i}>
          <CardHeader className="pb-3">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-6 w-12" />
              </div>
              <Skeleton className="h-2 w-full" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-9 w-full" />
          </CardContent>
        </Card>
      ))}
    </>
  );
}

function EmptyState() {
  return (
    <Card className="col-span-full">
      <CardContent className="flex flex-col items-center justify-center py-16">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <FileSearch className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="mb-2 font-display text-lg font-semibold">No analyses yet</h3>
        <p className="mb-6 max-w-sm text-center text-sm text-muted-foreground">
          Start analyzing job descriptions to build your history and track your career progress.
        </p>
        <Button asChild data-testid="button-first-analysis">
          <Link href="/analyze">
            <Plus className="mr-2 h-4 w-4" />
            Create Your First Analysis
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

export default function History() {
  const { data: analyses, isLoading } = useQuery<JobAnalysis[]>({
    queryKey: ["/api/history"],
  });

  return (
    <div className="space-y-8 p-6 md:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Analysis History</h1>
          <p className="text-muted-foreground">
            View and manage your past job analyses.
          </p>
        </div>
        <Button asChild data-testid="button-new-analysis">
          <Link href="/analyze">
            <Plus className="mr-2 h-4 w-4" />
            New Analysis
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <LoadingSkeleton />
        ) : analyses && analyses.length > 0 ? (
          analyses.map((analysis) => (
            <HistoryCard key={analysis.id} analysis={analysis} />
          ))
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
}
