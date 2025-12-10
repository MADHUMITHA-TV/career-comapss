import { Link } from "wouter";
import { Compass, FileSearch, Target, MessageSquare, ArrowRight, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ThemeToggle";

const features = [
  {
    icon: FileSearch,
    title: "Job Analysis",
    description: "Paste any job description and get an instant match score based on your resume.",
  },
  {
    icon: Target,
    title: "Gap Analysis",
    description: "Discover missing skills and get actionable tips to improve your application.",
  },
  {
    icon: MessageSquare,
    title: "Career Q&A",
    description: "Ask career questions and get personalized guidance for your journey.",
  },
];

const benefits = [
  "Intelligent skill matching algorithm",
  "Personalized recommendations",
  "Track your application history",
  "Natural language career advice",
];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 md:px-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Compass className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display text-lg font-bold">Career Compass</span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" asChild data-testid="button-login">
              <Link href="/login">Sign in</Link>
            </Button>
            <Button asChild data-testid="button-register">
              <Link href="/register">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto max-w-7xl px-4 py-20 md:px-8 md:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Navigate Your Career
              <span className="block text-primary">With Confidence</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground md:text-xl">
              Analyze job descriptions, evaluate your resume match, identify skill gaps, and get
              personalized career guidance — all in one place.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="lg" asChild className="w-full sm:w-auto" data-testid="button-get-started">
                <Link href="/register">
                  Start Free Analysis
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="w-full sm:w-auto">
                <Link href="/login">Sign in to Dashboard</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="border-t bg-card/50 py-20">
          <div className="mx-auto max-w-7xl px-4 md:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="font-display text-3xl font-bold tracking-tight">
                Everything You Need to Land Your Dream Job
              </h2>
              <p className="mt-4 text-muted-foreground">
                Powerful tools designed for college students entering the job market.
              </p>
            </div>

            <div className="mt-16 grid gap-6 md:grid-cols-3">
              {features.map((feature, index) => (
                <Card key={index} className="relative overflow-hidden">
                  <CardContent className="p-6">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-display text-xl font-semibold">{feature.title}</h3>
                    <p className="mt-2 text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="mx-auto max-w-7xl px-4 md:px-8">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <div>
                <h2 className="font-display text-3xl font-bold tracking-tight">
                  Get Job-Ready in Minutes
                </h2>
                <p className="mt-4 text-lg text-muted-foreground">
                  Our intelligent matching algorithm analyzes your resume against job descriptions
                  to give you actionable insights and recommendations.
                </p>
                <ul className="mt-8 space-y-4">
                  {benefits.map((benefit, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 flex-shrink-0 text-primary" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-8">
                  <Button asChild size="lg" data-testid="button-try-now">
                    <Link href="/register">
                      Try It Now - Free
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>

              <Card className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="bg-gradient-to-br from-primary/20 via-accent to-primary/10 p-8">
                    <div className="rounded-lg border bg-card p-6 shadow-lg">
                      <div className="mb-4 text-center">
                        <span className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                          Match Score
                        </span>
                        <div className="mt-2 font-display text-5xl font-bold text-primary">8/10</div>
                        <p className="mt-1 text-sm text-muted-foreground">Strong Match</p>
                      </div>
                      <div className="h-3 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{ width: "80%" }}
                        />
                      </div>
                      <p className="mt-4 text-center text-sm text-muted-foreground">
                        Your profile matches 80% of the job requirements
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="border-t bg-card/50 py-20">
          <div className="mx-auto max-w-3xl px-4 text-center md:px-8">
            <h2 className="font-display text-3xl font-bold tracking-tight">
              Ready to Accelerate Your Career?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Join thousands of students who are already using Career Compass to land their dream
              jobs.
            </p>
            <div className="mt-8">
              <Button size="lg" asChild data-testid="button-start-now">
                <Link href="/register">
                  Get Started for Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-8">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Compass className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-display font-bold">Career Compass</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Helping students navigate their career journey.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
