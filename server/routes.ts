import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import bcrypt from "bcrypt";
import type {
  AnalyzeJobRequest,
  AnalyzeJobResponse,
  GapAnalysis,
  QueryRequest,
} from "@shared/schema";

declare module "express-session" {
  interface SessionData {
    userId: string;
  }
}

const TECH_SKILLS = [
  "javascript", "typescript", "python", "java", "c++", "c#", "go", "rust", "ruby", "php",
  "react", "vue", "angular", "svelte", "next.js", "node.js", "express", "django", "flask", "spring",
  "sql", "postgresql", "mysql", "mongodb", "redis", "elasticsearch", "graphql",
  "aws", "azure", "gcp", "docker", "kubernetes", "terraform", "jenkins", "ci/cd",
  "git", "github", "gitlab", "jira", "agile", "scrum",
  "html", "css", "sass", "tailwind", "bootstrap", "figma",
  "rest api", "microservices", "api design", "system design",
  "machine learning", "deep learning", "tensorflow", "pytorch", "pandas", "numpy",
  "data analysis", "data science", "statistics", "spark", "hadoop",
  "linux", "unix", "bash", "shell scripting",
  "testing", "jest", "pytest", "selenium", "cypress", "unit testing",
  "security", "oauth", "jwt", "encryption",
  "communication", "leadership", "teamwork", "problem solving", "critical thinking",
];

function extractSkills(text: string): string[] {
  const lowerText = text.toLowerCase();
  const foundSkills: string[] = [];
  
  for (const skill of TECH_SKILLS) {
    const regex = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    if (regex.test(lowerText)) {
      foundSkills.push(skill);
    }
  }
  
  return Array.from(new Set(foundSkills));
}

function analyzeJobMatch(
  jobDescription: string,
  resumeText: string
): { matchScore: number; gapAnalysis: GapAnalysis; recommendations: string[]; interpretation: string } {
  const jobSkills = extractSkills(jobDescription);
  const resumeSkills = extractSkills(resumeText);
  
  const matchedSkills = jobSkills.filter((skill) =>
    resumeSkills.some((rs) => rs.toLowerCase() === skill.toLowerCase())
  );
  const missingSkills = jobSkills.filter(
    (skill) => !resumeSkills.some((rs) => rs.toLowerCase() === skill.toLowerCase())
  );
  
  let matchScore = 0;
  if (jobSkills.length > 0) {
    matchScore = Math.round((matchedSkills.length / jobSkills.length) * 10);
  } else {
    matchScore = 5;
  }
  
  matchScore = Math.max(1, Math.min(10, matchScore));
  
  const gapAnalysis: GapAnalysis = {
    matchedSkills: matchedSkills.map((s) => s.charAt(0).toUpperCase() + s.slice(1)),
    missingSkills: missingSkills.map((s) => s.charAt(0).toUpperCase() + s.slice(1)),
    requiredSkills: jobSkills.map((s) => s.charAt(0).toUpperCase() + s.slice(1)),
  };
  
  const recommendations: string[] = [];
  
  if (missingSkills.length > 0) {
    const topMissing = missingSkills.slice(0, 3);
    recommendations.push(
      `Focus on learning ${topMissing.join(", ")} as these are key requirements for this role.`
    );
  }
  
  if (missingSkills.includes("aws") || missingSkills.includes("docker") || missingSkills.includes("kubernetes")) {
    recommendations.push(
      "Consider getting certified in cloud technologies (AWS, Azure, or GCP) to strengthen your profile."
    );
  }
  
  if (matchedSkills.length > 0) {
    recommendations.push(
      `Highlight your experience with ${matchedSkills.slice(0, 3).join(", ")} prominently in your resume.`
    );
  }
  
  if (matchScore < 6) {
    recommendations.push(
      "Consider taking online courses or building projects to demonstrate skills in the missing areas."
    );
  }
  
  if (recommendations.length === 0) {
    recommendations.push(
      "Your profile aligns well with this role. Tailor your cover letter to emphasize your relevant experience."
    );
  }
  
  let interpretation: string;
  if (matchScore >= 8) {
    interpretation = "Excellent match! Your skills align strongly with this role's requirements.";
  } else if (matchScore >= 6) {
    interpretation = "Good match! You have most of the required skills with some areas for improvement.";
  } else if (matchScore >= 4) {
    interpretation = "Moderate match. Consider building skills in the missing areas before applying.";
  } else {
    interpretation = "This role requires skills you may need to develop. Focus on the gap analysis to improve.";
  }
  
  return { matchScore, gapAnalysis, recommendations, interpretation };
}

function generateCareerResponse(query: string): string {
  const lowerQuery = query.toLowerCase();
  
  if (lowerQuery.includes("data science") || lowerQuery.includes("data scientist")) {
    return `For data science roles, focus on these key skills:

**Technical Skills:**
- Python (pandas, numpy, scikit-learn)
- SQL and database management
- Machine learning algorithms
- Statistics and probability
- Data visualization (matplotlib, seaborn, Tableau)
- Big data tools (Spark, Hadoop)

**Learning Path:**
1. Start with Python fundamentals and data manipulation
2. Learn statistics and probability theory
3. Study machine learning algorithms
4. Practice with real datasets on Kaggle
5. Build portfolio projects

**Certifications to Consider:**
- Google Data Analytics Certificate
- IBM Data Science Professional Certificate
- AWS Machine Learning Specialty`;
  }
  
  if (lowerQuery.includes("frontend") || lowerQuery.includes("front-end") || lowerQuery.includes("front end")) {
    return `For frontend developer positions, here's what you need:

**Core Skills:**
- HTML5, CSS3, and JavaScript (ES6+)
- React, Vue, or Angular framework
- Responsive design and CSS frameworks (Tailwind, Bootstrap)
- Version control with Git
- API integration and REST

**Advanced Skills:**
- TypeScript
- State management (Redux, Zustand)
- Testing (Jest, Cypress)
- Performance optimization
- Accessibility (WCAG)

**Portfolio Tips:**
1. Build 3-5 polished projects
2. Include responsive designs
3. Show API integration skills
4. Contribute to open source
5. Deploy projects live (Vercel, Netlify)`;
  }
  
  if (lowerQuery.includes("interview") || lowerQuery.includes("prepare")) {
    return `Here's how to prepare for technical interviews:

**Preparation Strategy:**
1. **Data Structures & Algorithms** - Practice on LeetCode (aim for 100+ problems)
2. **System Design** - Study common patterns and trade-offs
3. **Behavioral Questions** - Use STAR method for responses
4. **Company Research** - Understand their tech stack and culture

**Common Topics:**
- Arrays, strings, linked lists
- Trees, graphs, hash tables
- Sorting and searching algorithms
- Dynamic programming basics

**Tips for Success:**
- Practice coding without IDE assistance
- Think out loud during problem-solving
- Ask clarifying questions
- Discuss time/space complexity
- Mock interviews with peers`;
  }
  
  if (lowerQuery.includes("resume") || lowerQuery.includes("cv")) {
    return `Here are tips to improve your resume:

**Structure:**
1. Contact info and LinkedIn
2. Professional summary (2-3 sentences)
3. Technical skills section
4. Work experience (most recent first)
5. Projects (with links)
6. Education

**Best Practices:**
- Use action verbs (Built, Developed, Led)
- Quantify achievements (Improved by 30%)
- Tailor for each application
- Keep to 1-2 pages
- Use a clean, ATS-friendly format

**Technical Resume Tips:**
- List programming languages and frameworks
- Include GitHub and portfolio links
- Describe project impact, not just features
- Remove outdated technologies`;
  }
  
  if (lowerQuery.includes("project") || lowerQuery.includes("portfolio")) {
    return `Here are project ideas to build your portfolio:

**Beginner Projects:**
- Personal portfolio website
- Todo app with authentication
- Weather dashboard using APIs
- Blog with CMS

**Intermediate Projects:**
- E-commerce store
- Social media clone
- Real-time chat application
- Task management system

**Advanced Projects:**
- Full-stack SaaS application
- Machine learning model deployment
- Microservices architecture demo
- Open source contribution

**Tips:**
- Focus on quality over quantity
- Document your code well
- Deploy projects live
- Write about your process
- Include README files`;
  }
  
  return `Great question! Here are some general career tips:

**Building Your Tech Career:**
1. **Learn continuously** - Technology evolves rapidly
2. **Build projects** - Hands-on experience matters most
3. **Network** - Connect with professionals on LinkedIn
4. **Contribute** - Open source shows collaboration skills
5. **Stay current** - Follow tech blogs and podcasts

**Job Search Tips:**
- Apply to 10-20 positions per week
- Customize each application
- Follow up professionally
- Practice interviewing regularly
- Consider internships or apprenticeships

Feel free to ask more specific questions about skills, interviews, or career paths!`;
}

function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Authentication required" });
  }
  next();
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.post("/api/auth/register", async (req, res) => {
    try {
      const schema = z.object({
        name: z.string().min(2),
        email: z.string().email(),
        password: z.string().min(6),
      });

      const data = schema.parse(req.body);

      const existingUser = await storage.getUserByEmail(data.email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already registered" });
      }

      const hashedPassword = await bcrypt.hash(data.password, 10);
      const user = await storage.createUser({
        name: data.name,
        email: data.email,
        password: hashedPassword,
      });

      req.session.userId = user.id;

      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      console.error("Registration error:", error);
      res.status(500).json({ message: "Registration failed" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const schema = z.object({
        email: z.string().email(),
        password: z.string(),
      });

      const data = schema.parse(req.body);

      const user = await storage.getUserByEmail(data.email);
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const validPassword = await bcrypt.compare(data.password, user.password);
      if (!validPassword) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      req.session.userId = user.id;

      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.clearCookie("connect.sid");
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/me", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const user = await storage.getUser(req.session.userId);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    const { password: _, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword });
  });

  app.post("/api/analyze-job", requireAuth, async (req, res) => {
    try {
      const schema = z.object({
        jobDescription: z.string().min(10),
        resumeText: z.string().min(10),
        jobTitle: z.string().optional(),
        companyName: z.string().optional(),
      });

      const data = schema.parse(req.body) as AnalyzeJobRequest;

      const result = analyzeJobMatch(data.jobDescription, data.resumeText);

      await storage.createJobAnalysis({
        userId: req.session.userId!,
        jobTitle: data.jobTitle || "Untitled Position",
        companyName: data.companyName || null,
        jobDescription: data.jobDescription,
        resumeText: data.resumeText,
        matchScore: result.matchScore,
        gapAnalysis: result.gapAnalysis,
        recommendations: result.recommendations,
      });

      const response: AnalyzeJobResponse = {
        matchScore: result.matchScore,
        gapAnalysis: result.gapAnalysis,
        recommendations: result.recommendations,
        interpretation: result.interpretation,
      };

      res.json(response);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      console.error("Analysis error:", error);
      res.status(500).json({ message: "Analysis failed" });
    }
  });

  app.post("/api/query", requireAuth, async (req, res) => {
    try {
      const schema = z.object({
        query: z.string().min(1),
      });

      const data = schema.parse(req.body) as QueryRequest;

      await storage.createChatMessage({
        userId: req.session.userId!,
        role: "user",
        content: data.query,
      });

      const response = generateCareerResponse(data.query);

      await storage.createChatMessage({
        userId: req.session.userId!,
        role: "assistant",
        content: response,
      });

      res.json({ response });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      console.error("Query error:", error);
      res.status(500).json({ message: "Query failed" });
    }
  });

  app.get("/api/chat/history", requireAuth, async (req, res) => {
    try {
      const messages = await storage.getChatMessages(req.session.userId!);
      res.json(messages);
    } catch (error) {
      console.error("Chat history error:", error);
      res.status(500).json({ message: "Failed to fetch chat history" });
    }
  });

  app.get("/api/history", requireAuth, async (req, res) => {
    try {
      const analyses = await storage.getJobAnalyses(req.session.userId!);
      res.json(analyses);
    } catch (error) {
      console.error("History error:", error);
      res.status(500).json({ message: "Failed to fetch history" });
    }
  });

  app.delete("/api/history/:id", requireAuth, async (req, res) => {
    try {
      const analysis = await storage.getJobAnalysis(req.params.id);
      if (!analysis) {
        return res.status(404).json({ message: "Analysis not found" });
      }
      if (analysis.userId !== req.session.userId) {
        return res.status(403).json({ message: "Not authorized" });
      }

      await storage.deleteJobAnalysis(req.params.id);
      res.json({ message: "Analysis deleted" });
    } catch (error) {
      console.error("Delete error:", error);
      res.status(500).json({ message: "Failed to delete analysis" });
    }
  });

  return httpServer;
}
