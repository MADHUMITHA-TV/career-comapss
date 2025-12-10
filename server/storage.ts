import {
  users,
  jobAnalyses,
  chatMessages,
  type User,
  type InsertUser,
  type JobAnalysis,
  type InsertJobAnalysis,
  type ChatMessage,
  type InsertChatMessage,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getJobAnalyses(userId: string): Promise<JobAnalysis[]>;
  getJobAnalysis(id: string): Promise<JobAnalysis | undefined>;
  createJobAnalysis(analysis: InsertJobAnalysis): Promise<JobAnalysis>;
  deleteJobAnalysis(id: string): Promise<void>;
  
  getChatMessages(userId: string): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getJobAnalyses(userId: string): Promise<JobAnalysis[]> {
    return db
      .select()
      .from(jobAnalyses)
      .where(eq(jobAnalyses.userId, userId))
      .orderBy(desc(jobAnalyses.createdAt));
  }

  async getJobAnalysis(id: string): Promise<JobAnalysis | undefined> {
    const [analysis] = await db
      .select()
      .from(jobAnalyses)
      .where(eq(jobAnalyses.id, id));
    return analysis || undefined;
  }

  async createJobAnalysis(analysis: InsertJobAnalysis): Promise<JobAnalysis> {
    const [created] = await db
      .insert(jobAnalyses)
      .values(analysis)
      .returning();
    return created;
  }

  async deleteJobAnalysis(id: string): Promise<void> {
    await db.delete(jobAnalyses).where(eq(jobAnalyses.id, id));
  }

  async getChatMessages(userId: string): Promise<ChatMessage[]> {
    return db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.userId, userId))
      .orderBy(chatMessages.createdAt);
  }

  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const [created] = await db
      .insert(chatMessages)
      .values(message)
      .returning();
    return created;
  }
}

export const storage = new DatabaseStorage();
