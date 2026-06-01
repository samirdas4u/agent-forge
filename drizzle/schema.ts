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
  // Streak tracking
  streakDays: int("streakDays").default(0).notNull(),
  longestStreak: int("longestStreak").default(0).notNull(),
  lastPracticeDate: varchar("lastPracticeDate", { length: 10 }), // YYYY-MM-DD
  totalSessions: int("totalSessions").default(0).notNull(),
  avgScore: float("avgScore"),
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
  personaRole: varchar("personaRole", { length: 255 }),
  personaCompany: varchar("personaCompany", { length: 255 }),
  personaPersonality: varchar("personaPersonality", { length: 64 }),
  channel: varchar("channel", { length: 32 }).default("text"),
  learnerRole: varchar("learnerRole", { length: 255 }),
  learnerTeam: varchar("learnerTeam", { length: 255 }),
  focusSkill: varchar("focusSkill", { length: 255 }),
  scoringNotes: text("scoringNotes"),
  tags: json("tags").$type<string[]>().default([]),
  estimatedMinutes: int("estimatedMinutes").default(10),
  languageLock: varchar("languageLock", { length: 10 }), // null = any language; e.g. "fr", "es"
  folder: varchar("folder", { length: 255 }), // optional folder/collection name
  personaAvatarUrl: varchar("personaAvatarUrl", { length: 1024 }), // S3 URL for persona avatar
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
  language: varchar("language", { length: 10 }).default("en").notNull(),
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

// eLearning Courses
export const courses = mysqlTable("courses", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  status: mysqlEnum("status", ["draft", "published"]).default("draft").notNull(),
  sourceType: mysqlEnum("sourceType", ["pdf", "docx", "pptx", "text", "url"]).default("text").notNull(),
  sourceFileName: varchar("sourceFileName", { length: 255 }),
  slug: varchar("slug", { length: 255 }).unique(),
  estimatedMinutes: int("estimatedMinutes").default(30),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Course = typeof courses.$inferSelect;
export type InsertCourse = typeof courses.$inferInsert;

// Lessons within a course
export const lessons = mysqlTable("lessons", {
  id: int("id").autoincrement().primaryKey(),
  courseId: int("courseId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  objectives: text("objectives"),
  lessonOrder: int("lessonOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Lesson = typeof lessons.$inferSelect;
export type InsertLesson = typeof lessons.$inferInsert;

// Content blocks within a lesson
export const contentBlocks = mysqlTable("content_blocks", {
  id: int("id").autoincrement().primaryKey(),
  lessonId: int("lessonId").notNull(),
  blockType: mysqlEnum("blockType", ["text", "key_concept", "quiz", "summary", "callout"]).notNull().default("text"),
  content: json("content").notNull(), // flexible JSON per block type
  blockOrder: int("blockOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ContentBlock = typeof contentBlocks.$inferSelect;
export type InsertContentBlock = typeof contentBlocks.$inferInsert;

// Course enrollments / learner progress
export const courseEnrollments = mysqlTable("course_enrollments", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  courseId: int("courseId").notNull(),
  completedLessons: json("completedLessons").$type<number[]>().default([]),
  completedBlocks: json("completedBlocks").$type<number[]>().default([]),
  quizScores: json("quizScores").$type<Record<string, number>>().default({}),
  isCompleted: boolean("isCompleted").default(false).notNull(),
  completedAt: timestamp("completedAt"),
  startedAt: timestamp("startedAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CourseEnrollment = typeof courseEnrollments.$inferSelect;

// ─── Product Sandbox ─────────────────────────────────────────────────────────

// Sandbox instances — isolated test environments for engineers
export const sandboxInstances = mysqlTable("sandbox_instances", {
  id: int("id").autoincrement().primaryKey(),
  ownerId: int("ownerId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  status: mysqlEnum("status", ["active", "paused", "archived"]).default("active").notNull(),
  shareToken: varchar("shareToken", { length: 64 }).unique(),
  snapshotData: json("snapshotData").$type<Record<string, unknown>>(),
  baseTemplate: mysqlEnum("baseTemplate", ["blank", "sales", "customer_service", "onboarding"]).default("blank").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SandboxInstance = typeof sandboxInstances.$inferSelect;
export type InsertSandboxInstance = typeof sandboxInstances.$inferInsert;

// Feature flags per sandbox
export const featureFlags = mysqlTable("feature_flags", {
  id: int("id").autoincrement().primaryKey(),
  sandboxId: int("sandboxId").notNull(),
  flagKey: varchar("flagKey", { length: 100 }).notNull(),
  description: text("description"),
  enabled: boolean("enabled").default(false).notNull(),
  rolloutPct: int("rolloutPct").default(0).notNull(), // 0-100
  targeting: json("targeting").$type<{ userIds?: number[]; roles?: string[] }>().default({}),
  killSwitch: boolean("killSwitch").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FeatureFlag = typeof featureFlags.$inferSelect;
export type InsertFeatureFlag = typeof featureFlags.$inferInsert;

// Synthetic test runs
export const testRuns = mysqlTable("test_runs", {
  id: int("id").autoincrement().primaryKey(),
  sandboxId: int("sandboxId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  script: json("script").$type<TestScript>().notNull(),
  status: mysqlEnum("status", ["pending", "running", "passed", "failed", "error"]).default("pending").notNull(),
  results: json("results").$type<TestResult[]>().default([]),
  durationMs: int("durationMs"),
  passCount: int("passCount").default(0),
  failCount: int("failCount").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
});

export type TestScript = {
  turns: Array<{ userMessage: string; assertions: Array<{ type: "contains" | "score_gte" | "score_lte" | "not_contains"; value: string | number }> }>;
};
export type TestResult = {
  turnIndex: number;
  userMessage: string;
  aiResponse: string;
  score: number;
  assertions: Array<{ type: string; value: string | number; passed: boolean; actual: string | number }>;
  latencyMs: number;
  tokenUsage: { prompt: number; completion: number; total: number };
};

export type TestRun = typeof testRuns.$inferSelect;
export type InsertTestRun = typeof testRuns.$inferInsert;

// AI Personas (for Persona Lab)
export const personas = mysqlTable("personas", {
  id: int("id").autoincrement().primaryKey(),
  sandboxId: int("sandboxId"),
  ownerId: int("ownerId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  role: varchar("role", { length: 255 }),
  tone: mysqlEnum("tone", ["professional", "friendly", "aggressive", "skeptical", "neutral", "enthusiastic"]).default("professional").notNull(),
  systemPrompt: text("systemPrompt").notNull(),
  temperature: float("temperature").default(0.7).notNull(),
  isPublished: boolean("isPublished").default(false).notNull(),
  version: int("version").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Persona = typeof personas.$inferSelect;
export type InsertPersona = typeof personas.$inferInsert;

// Sandbox event log
export const sandboxEvents = mysqlTable("sandbox_events", {
  id: int("id").autoincrement().primaryKey(),
  sandboxId: int("sandboxId").notNull(),
  eventType: varchar("eventType", { length: 100 }).notNull(),
  payload: json("payload").$type<Record<string, unknown>>().default({}),
  userId: int("userId"),
  severity: mysqlEnum("severity", ["info", "warning", "error", "debug"]).default("info").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SandboxEvent = typeof sandboxEvents.$inferSelect;
export type InsertSandboxEvent = typeof sandboxEvents.$inferInsert;

// ─── Agentic AI tables ────────────────────────────────────────────────────────

// Agent events — every autonomous action taken by any agent
export const agentEvents = mysqlTable("agent_events", {
  id: int("id").autoincrement().primaryKey(),
  agentType: mysqlEnum("agentType", [
    "simulation",
    "coaching",
    "evaluation",
    "planning",
    "orchestrator",
  ]).notNull(),
  eventType: varchar("eventType", { length: 100 }).notNull(),
  userId: int("userId"),
  sessionId: int("sessionId"),
  payload: json("payload").$type<Record<string, unknown>>().default({}),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AgentEvent = typeof agentEvents.$inferSelect;
export type InsertAgentEvent = typeof agentEvents.$inferInsert;

// Coaching nudges — micro-interventions sent to learners
export const coachingNudges = mysqlTable("coaching_nudges", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  sessionId: int("sessionId"),
  nudgeType: mysqlEnum("nudgeType", [
    "encouragement",
    "tip",
    "warning",
    "milestone",
    "difficulty_change",
  ]).notNull().default("tip"),
  title: varchar("title", { length: 200 }).notNull(),
  body: text("body").notNull(),
  viewed: boolean("viewed").notNull().default(false),
  helpful: boolean("helpful"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CoachingNudge = typeof coachingNudges.$inferSelect;
export type InsertCoachingNudge = typeof coachingNudges.$inferInsert;

// Learning paths — curated sequences of scenarios for a user
export const learningPaths = mysqlTable("learning_paths", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  scenarioIds: json("scenarioIds").$type<number[]>().notNull().default([]),
  completedIds: json("completedIds").$type<number[]>().notNull().default([]),
  status: mysqlEnum("status", ["active", "completed", "paused"]).notNull().default("active"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type LearningPath = typeof learningPaths.$inferSelect;
export type InsertLearningPath = typeof learningPaths.$inferInsert;

// Difficulty adjustments — log of automated difficulty changes
export const difficultyAdjustments = mysqlTable("difficulty_adjustments", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  sessionId: int("sessionId"),
  fromDifficulty: mysqlEnum("fromDifficulty", ["beginner", "intermediate", "advanced"]).notNull(),
  toDifficulty: mysqlEnum("toDifficulty", ["beginner", "intermediate", "advanced"]).notNull(),
  reason: varchar("reason", { length: 500 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type DifficultyAdjustment = typeof difficultyAdjustments.$inferSelect;
export type InsertDifficultyAdjustment = typeof difficultyAdjustments.$inferInsert;
