import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { FileText, Upload, Loader2, Target, CheckCircle, AlertCircle, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { AnalyzeJobRequest, AnalyzeJobResponse } from "@shared/schema";

function MatchScoreDisplay({ score, interpretation }: { score: number; interpretation: string }) {
  const matchLevel =
    score >= 8 ? "Strong Match" : score >= 6 ? "Good Match" : score >= 4 ? "Moderate Match" : "Needs Improvement";
  const matchColor =
    score >= 8
      ? "text-green-600 dark:text-green-400"
      : score >= 6
        ? "text-yellow-600 dark:text-yellow-400"
        : "text-red-600 dark:text-red-400";

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-center">
          <span className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
            Match Score
          </span>
          <div className={`mt-2 font-display text-5xl font-bold ${matchColor}`} data-testid="text-match-score">
            {score}/10
          </div>
          <Badge variant="secondary" className="mt-2" data-testid="badge-match-level">
            {matchLevel}
          </Badge>
        </div>
        <Progress value={score * 10} className="mt-6 h-3" />
        <p className="mt-4 text-center text-sm text-muted-foreground" data-testid="text-interpretation">
          {interpretation}
        </p>
      </CardContent>
    </Card>
  );
}

function GapAnalysisDisplay({ gapAnalysis }: { gapAnalysis: AnalyzeJobResponse["gapAnalysis"] }) {
  return (
    <div className="space-y-6">
      <div>
        <div className="mb-3 flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
          <h3 className="font-semibold">Matched Skills</h3>
          <Badge variant="secondary" className="text-xs">
            {gapAnalysis.matchedSkills.length}
          </Badge>
        </div>
        <div className="flex flex-wrap gap-2">
          {gapAnalysis.matchedSkills.length > 0 ? (
            gapAnalysis.matchedSkills.map((skill, i) => (
              <Badge key={i} variant="outline" className="bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300" data-testid={`badge-matched-${i}`}>
                {skill}
              </Badge>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No matching skills found yet.</p>
          )}
        </div>
      </div>

      <div>
        <div className="mb-3 flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
          <h3 className="font-semibold">Missing Skills</h3>
          <Badge variant="secondary" className="text-xs">
            {gapAnalysis.missingSkills.length}
          </Badge>
        </div>
        <div className="flex flex-wrap gap-2">
          {gapAnalysis.missingSkills.length > 0 ? (
            gapAnalysis.missingSkills.map((skill, i) => (
              <Badge key={i} variant="outline" className="bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300" data-testid={`badge-missing-${i}`}>
                {skill}
              </Badge>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">Great! No critical skill gaps detected.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function RecommendationsDisplay({ recommendations }: { recommendations: string[] }) {
  return (
    <div className="space-y-3">
      {recommendations.map((rec, i) => (
        <div
          key={i}
          className="flex gap-4 rounded-lg border border-l-4 border-l-primary bg-card p-4"
          data-testid={`recommendation-${i}`}
        >
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
            {i + 1}
          </div>
          <div>
            <p className="text-sm">{rec}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function JobAnalysis() {
  const { toast } = useToast();
  const [jobDescription, setJobDescription] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [inputMode, setInputMode] = useState<"paste" | "upload">("paste");
  const [result, setResult] = useState<AnalyzeJobResponse | null>(null);

  const analyzeMutation = useMutation({
    mutationFn: async (data: AnalyzeJobRequest) => {
      const response = await apiRequest("POST", "/api/analyze-job", data);
      return response.json() as Promise<AnalyzeJobResponse>;
    },
    onSuccess: (data) => {
      setResult(data);
      queryClient.invalidateQueries({ queryKey: ["/api/history"] });
      toast({
        title: "Analysis Complete!",
        description: `Your match score is ${data.matchScore}/10`,
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Something went wrong",
      });
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!jobDescription.trim() || !resumeText.trim()) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please provide both a job description and your resume.",
      });
      return;
    }
    analyzeMutation.mutate({
      jobDescription,
      resumeText,
      jobTitle: jobTitle || undefined,
      companyName: companyName || undefined,
    });
  }

  function handleClear() {
    setJobDescription("");
    setResumeText("");
    setJobTitle("");
    setCompanyName("");
    setResult(null);
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-6 md:p-8">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">Job Analysis</h1>
        <p className="text-muted-foreground">
          Paste a job description and your resume to get an instant match analysis.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Job Description
              </CardTitle>
              <CardDescription>Paste the full job posting here</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="jobTitle">Job Title (optional)</Label>
                  <Input
                    id="jobTitle"
                    placeholder="e.g., Frontend Developer"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    data-testid="input-job-title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company (optional)</Label>
                  <Input
                    id="companyName"
                    placeholder="e.g., Tech Corp"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    data-testid="input-company"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="jobDescription">Description</Label>
                  <span className="text-xs text-muted-foreground">
                    {jobDescription.length} characters
                  </span>
                </div>
                <Textarea
                  id="jobDescription"
                  placeholder="Paste the job description here..."
                  className="min-h-48 resize-none"
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  data-testid="textarea-job-description"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Your Resume
              </CardTitle>
              <CardDescription>Paste your resume text or upload a file</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Tabs value={inputMode} onValueChange={(v) => setInputMode(v as "paste" | "upload")}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="paste" data-testid="tab-paste">Paste Text</TabsTrigger>
                  <TabsTrigger value="upload" data-testid="tab-upload">Upload File</TabsTrigger>
                </TabsList>
                <TabsContent value="paste" className="mt-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="resumeText">Resume Content</Label>
                      <span className="text-xs text-muted-foreground">
                        {resumeText.length} characters
                      </span>
                    </div>
                    <Textarea
                      id="resumeText"
                      placeholder="Paste your resume content here..."
                      className="min-h-48 resize-none"
                      value={resumeText}
                      onChange={(e) => setResumeText(e.target.value)}
                      data-testid="textarea-resume"
                    />
                  </div>
                </TabsContent>
                <TabsContent value="upload" className="mt-4">
                  <div className="flex min-h-48 flex-col items-center justify-center rounded-lg border-2 border-dashed bg-muted/20 p-6">
                    <Upload className="mb-3 h-10 w-10 text-muted-foreground" />
                    <p className="mb-1 text-sm font-medium">Drop your resume here</p>
                    <p className="text-xs text-muted-foreground">
                      Supported formats: TXT (PDF coming soon)
                    </p>
                    <Input
                      type="file"
                      accept=".txt"
                      className="mt-4 max-w-xs"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            setResumeText(event.target?.result as string);
                            setInputMode("paste");
                          };
                          reader.readAsText(file);
                        }
                      }}
                      data-testid="input-file-upload"
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button
              type="submit"
              className="flex-1"
              disabled={analyzeMutation.isPending}
              data-testid="button-analyze"
            >
              {analyzeMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Target className="mr-2 h-4 w-4" />
                  Analyze Match
                </>
              )}
            </Button>
            <Button type="button" variant="outline" onClick={handleClear} data-testid="button-clear">
              Clear
            </Button>
          </div>
        </form>

        <div className="space-y-6">
          {result ? (
            <>
              <MatchScoreDisplay score={result.matchScore} interpretation={result.interpretation} />
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Gap Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <GapAnalysisDisplay gapAnalysis={result.gapAnalysis} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5" />
                    Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RecommendationsDisplay recommendations={result.recommendations} />
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="flex h-full min-h-96 items-center justify-center">
              <CardContent className="text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted mx-auto">
                  <Target className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="mb-2 font-display text-lg font-semibold">Ready to Analyze</h3>
                <p className="max-w-sm text-sm text-muted-foreground">
                  Fill in the job description and your resume on the left, then click "Analyze Match"
                  to see your results.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
