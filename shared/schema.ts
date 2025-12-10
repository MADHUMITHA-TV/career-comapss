import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Users table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
});

// Job Analyses table
export const jobAnalyses = pgTable("job_analyses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  jobTitle: text("job_title").notNull(),
  companyName: text("company_name"),
  jobDescription: text("job_description").notNull(),
  resumeText: text("resume_text").notNull(),
  matchScore: integer("match_score").notNull(),
  gapAnalysis: json("gap_analysis").$type<GapAnalysis>().notNull(),
  recommendations: json("recommendations").$type<string[]>().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Skills table
export const skills = pgTable("skills", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  category: text("category"),
});

// Chat messages table
export const chatMessages = pgTable("chat_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  role: text("role").notNull(), // 'user' or 'assistant'
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  jobAnalyses: many(jobAnalyses),
  chatMessages: many(chatMessages),
}));

export const jobAnalysesRelations = relations(jobAnalyses, ({ one }) => ({
  user: one(users, {
    fields: [jobAnalyses.userId],
    references: [users.id],
  }),
}));

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  user: one(users, {
    fields: [chatMessages.userId],
    references: [users.id],
  }),
}));

// Types
export interface GapAnalysis {
  missingSkills: string[];
  matchedSkills: string[];
  requiredSkills: string[];
}

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  name: true,
  email: true,
  password: true,
});

export const insertJobAnalysisSchema = createInsertSchema(jobAnalyses).omit({
  id: true,
  createdAt: true,
});

export const insertSkillSchema = createInsertSchema(skills).omit({
  id: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  createdAt: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type JobAnalysis = typeof jobAnalyses.$inferSelect;
export type InsertJobAnalysis = z.infer<typeof insertJobAnalysisSchema>;
export type Skill = typeof skills.$inferSelect;
export type InsertSkill = z.infer<typeof insertSkillSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;

// API request/response types
export interface AnalyzeJobRequest {
  jobDescription: string;
  resumeText: string;
  jobTitle?: string;
  companyName?: string;
}

export interface AnalyzeJobResponse {
  matchScore: number;
  gapAnalysis: GapAnalysis;
  recommendations: string[];
  interpretation: string;
}

export interface QueryRequest {
  query: string;
}

export interface QueryResponse {
  response: string;
}

export interface AuthResponse {
  user: Omit<User, 'password'>;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}
