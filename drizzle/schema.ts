import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  json,
  boolean,
  float,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Scenarios for conversation simulation
export const scenarios = mysqlTable("scenarios", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  category: mysqlEnum("category", ["sales", "customer_service", "interview", "negotiation", "presentation"]).notNull(),
  difficulty: mysqlEnum("difficulty", ["beginner", "intermediate", "advanced"]).notNull().default("beginner"),
  systemPrompt: text("systemPrompt").notNull(),
  aiPersona: varchar("aiPersona", { length: 255 }),
  tags: json("tags").$type<string[]>().default([]),
  estimatedMinutes: int("estimatedMinutes").default(10),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Scenario = typeof scenarios.$inferSelect;
export type InsertScenario = typeof scenarios.$inferInsert;

// Practice sessions
export const sessions = mysqlTable("sessions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  scenarioId: int("scenarioId").notNull(),
  status: mysqlEnum("status", ["active", "completed", "abandoned"]).default("active").notNull(),
  overallScore: float("overallScore"),
  clarityScore: float("clarityScore"),
  empathyScore: float("empathyScore"),
  persuasivenessScore: float("persuasivenessScore"),
  objectionHandlingScore: float("objectionHandlingScore"),
  professionalismScore: float("professionalismScore"),
  feedbackSummary: text("feedbackSummary"),
  strengths: json("strengths").$type<string[]>().default([]),
  improvements: json("improvements").$type<string[]>().default([]),
  durationSeconds: int("durationSeconds"),
  startedAt: timestamp("startedAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
});

export type Session = typeof sessions.$inferSelect;
export type InsertSession = typeof sessions.$inferInsert;

// Messages within sessions
export const messages = mysqlTable("messages", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: int("sessionId").notNull(),
  role: mysqlEnum("role", ["user", "assistant"]).notNull(),
  content: text("content").notNull(),
  feedback: text("feedback"),
  messageScore: float("messageScore"),
  scoreDimensions: json("scoreDimensions").$type<Record<string, number>>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;

// Tool walkthroughs
export const walkthroughs = mysqlTable("walkthroughs", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 100 }),
  difficulty: mysqlEnum("difficulty", ["beginner", "intermediate", "advanced"]).notNull().default("beginner"),
  steps: json("steps").$type<WalkthroughStep[]>().notNull(),
  estimatedMinutes: int("estimatedMinutes").default(5),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type WalkthroughStep = {
  id: number;
  title: string;
  description: string;
  instruction: string;
  hint?: string;
  imageUrl?: string;
  action?: "click" | "type" | "observe" | "navigate";
};

export type Walkthrough = typeof walkthroughs.$inferSelect;
export type InsertWalkthrough = typeof walkthroughs.$inferInsert;

// Walkthrough completions
export const walkthroughCompletions = mysqlTable("walkthrough_completions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  walkthroughId: int("walkthroughId").notNull(),
  completedSteps: json("completedSteps").$type<number[]>().default([]),
  isCompleted: boolean("isCompleted").default(false).notNull(),
  score: float("score"),
  completedAt: timestamp("completedAt"),
  startedAt: timestamp("startedAt").defaultNow().notNull(),
});

export type WalkthroughCompletion = typeof walkthroughCompletions.$inferSelect;
