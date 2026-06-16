import { and, desc, eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  contentBlocks,
  courseEnrollments,
  courses,
  lessons,
  messages,
  scenarios,
  sessions,
  users,
  walkthroughCompletions,
  walkthroughs,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ── Users ────────────────────────────────────────────────────
export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;

  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod"] as const;
  textFields.forEach((field) => {
    const value = user[field];
    if (value === undefined) return;
    const normalized = value ?? null;
    values[field] = normalized;
    updateSet[field] = normalized;
  });
  if (user.lastSignedIn !== undefined) {
    values.lastSignedIn = user.lastSignedIn;
    updateSet.lastSignedIn = user.lastSignedIn;
  }
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = "admin";
    updateSet.role = "admin";
  }
  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();

  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

// ── Scenarios ────────────────────────────────────────────────
export async function getScenarios(category?: string, difficulty?: string) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [eq(scenarios.isActive, true)];
  if (category) conditions.push(eq(scenarios.category, category as any));
  if (difficulty) conditions.push(eq(scenarios.difficulty, difficulty as any));
  return db.select().from(scenarios).where(and(...conditions)).orderBy(scenarios.category, scenarios.difficulty);
}

export async function getScenarioById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(scenarios).where(eq(scenarios.id, id)).limit(1);
  return result[0];
}

export async function createScenario(data: typeof scenarios.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(scenarios).values(data);
  return result;
}

// ── Sessions ─────────────────────────────────────────────────
export async function createSession(userId: number, scenarioId: number, language = "en") {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(sessions).values({ userId, scenarioId, language });
  const id = (result as any)[0]?.insertId ?? (result as any).insertId;
  return id as number;
}

export async function getSessionById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(sessions).where(eq(sessions.id, id)).limit(1);
  return result[0];
}

export async function getUserSessions(userId: number, limit = 20) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select({
      session: sessions,
      scenarioTitle: scenarios.title,
      scenarioCategory: scenarios.category,
    })
    .from(sessions)
    .leftJoin(scenarios, eq(sessions.scenarioId, scenarios.id))
    .where(eq(sessions.userId, userId))
    .orderBy(desc(sessions.startedAt))
    .limit(limit);
}

export async function updateSession(
  id: number,
  data: Partial<typeof sessions.$inferInsert>
) {
  const db = await getDb();
  if (!db) return;
  await db.update(sessions).set(data).where(eq(sessions.id, id));
}

// ── Messages ─────────────────────────────────────────────────
export async function addMessage(data: typeof messages.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(messages).values(data);
  const id = (result as any)[0]?.insertId ?? (result as any).insertId;
  return id as number;
}

export async function getSessionMessages(sessionId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(messages).where(eq(messages.sessionId, sessionId)).orderBy(messages.createdAt);
}

// ── Walkthroughs ─────────────────────────────────────────────
export async function getWalkthroughs(category?: string) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [eq(walkthroughs.isActive, true)];
  if (category) conditions.push(eq(walkthroughs.category, category));
  return db.select().from(walkthroughs).where(and(...conditions)).orderBy(walkthroughs.category);
}

export async function getWalkthroughById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(walkthroughs).where(eq(walkthroughs.id, id)).limit(1);
  return result[0];
}

export async function getOrCreateWalkthroughCompletion(userId: number, walkthroughId: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const existing = await db
    .select()
    .from(walkthroughCompletions)
    .where(and(eq(walkthroughCompletions.userId, userId), eq(walkthroughCompletions.walkthroughId, walkthroughId)))
    .limit(1);
  if (existing[0]) return existing[0];
  await db.insert(walkthroughCompletions).values({ userId, walkthroughId });
  const created = await db
    .select()
    .from(walkthroughCompletions)
    .where(and(eq(walkthroughCompletions.userId, userId), eq(walkthroughCompletions.walkthroughId, walkthroughId)))
    .limit(1);
  return created[0]!;
}

export async function updateWalkthroughCompletion(
  id: number,
  data: Partial<typeof walkthroughCompletions.$inferInsert>
) {
  const db = await getDb();
  if (!db) return;
  await db.update(walkthroughCompletions).set(data).where(eq(walkthroughCompletions.id, id));
}

export async function getUserWalkthroughCompletions(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select({ completion: walkthroughCompletions, walkthroughTitle: walkthroughs.title, walkthroughCategory: walkthroughs.category })
    .from(walkthroughCompletions)
    .leftJoin(walkthroughs, eq(walkthroughCompletions.walkthroughId, walkthroughs.id))
    .where(eq(walkthroughCompletions.userId, userId));
}

// ── Streak & leaderboard ─────────────────────────────────────
export async function updateUserStreak(userId: number) {
  const db = await getDb();
  if (!db) return;
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const userRow = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  const user = userRow[0];
  if (!user) return;

  const last = user.lastPracticeDate;
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

  let newStreak = user.streakDays ?? 0;
  if (last === today) {
    // Already practiced today — no change
  } else if (last === yesterday) {
    newStreak += 1;
  } else {
    newStreak = 1; // Streak broken
  }

  const newLongest = Math.max(newStreak, user.longestStreak ?? 0);
  const newTotal = (user.totalSessions ?? 0) + 1;

  // Recalculate avgScore from all completed sessions
  const completedSessions = await db
    .select({ overallScore: sessions.overallScore })
    .from(sessions)
    .where(and(eq(sessions.userId, userId), eq(sessions.status, "completed")));
  const scores = completedSessions.map(s => s.overallScore ?? 0).filter(s => s > 0);
  const newAvg = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : null;

  await db.update(users).set({
    streakDays: newStreak,
    longestStreak: newLongest,
    lastPracticeDate: today,
    totalSessions: newTotal,
    avgScore: newAvg,
  }).where(eq(users.id, userId));
}

export async function getLeaderboard(limit = 20) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select({
      id: users.id,
      name: users.name,
      streakDays: users.streakDays,
      longestStreak: users.longestStreak,
      totalSessions: users.totalSessions,
      avgScore: users.avgScore,
    })
    .from(users)
    .where(sql`${users.totalSessions} > 0`)
    .orderBy(desc(users.avgScore), desc(users.totalSessions))
    .limit(limit);
}

export async function getUserStreak(userId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db
    .select({
      streakDays: users.streakDays,
      longestStreak: users.longestStreak,
      lastPracticeDate: users.lastPracticeDate,
      totalSessions: users.totalSessions,
      avgScore: users.avgScore,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  return result[0] ?? null;
}

// ── Scenario admin CRUD ───────────────────────────────────────
export async function updateScenario(id: number, data: Partial<typeof scenarios.$inferInsert>) {
  const db = await getDb();
  if (!db) return;
  await db.update(scenarios).set(data).where(eq(scenarios.id, id));
}

export async function deleteScenario(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(scenarios).set({ isActive: false }).where(eq(scenarios.id, id));
}

export async function getAllScenarios() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(scenarios).orderBy(scenarios.category, scenarios.difficulty);
}

// ── Analytics ────────────────────────────────────────────────
export async function getUserAnalytics(userId: number) {
  const db = await getDb();
  if (!db) return null;

  const completedSessions = await db
    .select()
    .from(sessions)
    .where(and(eq(sessions.userId, userId), eq(sessions.status, "completed")));

  const totalSessions = completedSessions.length;
  if (totalSessions === 0) return { totalSessions: 0, avgScore: 0, categoryBreakdown: {}, recentSessions: [] };

  const avgScore = completedSessions.reduce((sum, s) => sum + (s.overallScore ?? 0), 0) / totalSessions;

  const categoryBreakdown: Record<string, { count: number; avgScore: number }> = {};

  const sessionWithScenario = await db
    .select({ session: sessions, category: scenarios.category })
    .from(sessions)
    .leftJoin(scenarios, eq(sessions.scenarioId, scenarios.id))
    .where(and(eq(sessions.userId, userId), eq(sessions.status, "completed")));

  for (const row of sessionWithScenario) {
    const cat = row.category ?? "unknown";
    if (!categoryBreakdown[cat]) categoryBreakdown[cat] = { count: 0, avgScore: 0 };
    categoryBreakdown[cat].count++;
    categoryBreakdown[cat].avgScore += row.session.overallScore ?? 0;
  }
  for (const cat of Object.keys(categoryBreakdown)) {
    categoryBreakdown[cat].avgScore /= categoryBreakdown[cat].count;
  }

  const recentSessions = await db
    .select({ session: sessions, scenarioTitle: scenarios.title, scenarioCategory: scenarios.category })
    .from(sessions)
    .leftJoin(scenarios, eq(sessions.scenarioId, scenarios.id))
    .where(and(eq(sessions.userId, userId), eq(sessions.status, "completed")))
    .orderBy(desc(sessions.completedAt))
    .limit(10);

  return { totalSessions, avgScore, categoryBreakdown, recentSessions };
}

// ── eLearning Courses ─────────────────────────────────────────────────────────

export async function createCourse(data: {
  userId: number;
  title: string;
  description?: string;
  sourceType: "pdf" | "docx" | "pptx" | "text" | "url";
  sourceFileName?: string;
  slug: string;
  estimatedMinutes?: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const [result] = await db.insert(courses).values(data);
  return (result as any).insertId as number;
}

export async function getCourseById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(courses).where(eq(courses.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function getCourseBySlug(slug: string) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(courses).where(eq(courses.slug, slug)).limit(1);
  return rows[0] ?? null;
}

export async function getUserCourses(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(courses).where(eq(courses.userId, userId)).orderBy(desc(courses.createdAt));
}

export async function updateCourse(id: number, data: Partial<{ title: string; description: string; status: "draft" | "published"; estimatedMinutes: number; slug: string }>) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.update(courses).set(data).where(eq(courses.id, id));
}

export async function deleteCourse(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  // cascade delete lessons and blocks
  const lessonRows = await db.select({ id: lessons.id }).from(lessons).where(eq(lessons.courseId, id));
  for (const l of lessonRows) {
    await db.delete(contentBlocks).where(eq(contentBlocks.lessonId, l.id));
  }
  await db.delete(lessons).where(eq(lessons.courseId, id));
  await db.delete(courseEnrollments).where(eq(courseEnrollments.courseId, id));
  await db.delete(courses).where(eq(courses.id, id));
}

export async function createLesson(data: { courseId: number; title: string; objectives?: string; lessonOrder: number }) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const [result] = await db.insert(lessons).values(data);
  return (result as any).insertId as number;
}

export async function getLessonsByCourse(courseId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(lessons).where(eq(lessons.courseId, courseId)).orderBy(lessons.lessonOrder);
}

export async function updateLesson(id: number, data: Partial<{ title: string; objectives: string; lessonOrder: number }>) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.update(lessons).set(data).where(eq(lessons.id, id));
}

export async function deleteLesson(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.delete(contentBlocks).where(eq(contentBlocks.lessonId, id));
  await db.delete(lessons).where(eq(lessons.id, id));
}

export async function createContentBlock(data: { lessonId: number; blockType: "text" | "key_concept" | "quiz" | "summary" | "callout"; content: unknown; blockOrder: number }) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const [result] = await db.insert(contentBlocks).values({ ...data, content: data.content as any });
  return (result as any).insertId as number;
}

export async function getBlocksByLesson(lessonId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(contentBlocks).where(eq(contentBlocks.lessonId, lessonId)).orderBy(contentBlocks.blockOrder);
}

export async function updateContentBlock(id: number, data: Partial<{ blockType: "text" | "key_concept" | "quiz" | "summary" | "callout"; content: unknown; blockOrder: number }>) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.update(contentBlocks).set({ ...data, content: data.content as any }).where(eq(contentBlocks.id, id));
}

export async function deleteContentBlock(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.delete(contentBlocks).where(eq(contentBlocks.id, id));
}

export async function getOrCreateEnrollment(userId: number, courseId: number) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const existing = await db.select().from(courseEnrollments)
    .where(and(eq(courseEnrollments.userId, userId), eq(courseEnrollments.courseId, courseId)))
    .limit(1);
  if (existing[0]) return existing[0];
  await db.insert(courseEnrollments).values({ userId, courseId });
  const fresh = await db.select().from(courseEnrollments)
    .where(and(eq(courseEnrollments.userId, userId), eq(courseEnrollments.courseId, courseId)))
    .limit(1);
  return fresh[0]!;
}

export async function updateEnrollment(id: number, data: Partial<{ completedLessons: number[]; completedBlocks: number[]; quizScores: Record<string, number>; isCompleted: boolean; completedAt: Date }>) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.update(courseEnrollments).set(data as any).where(eq(courseEnrollments.id, id));
}

export async function getCourseFull(courseId: number) {
  const db = await getDb();
  if (!db) return null;
  const course = await getCourseById(courseId);
  if (!course) return null;
  const lessonRows = await getLessonsByCourse(courseId);
  const lessonsWithBlocks = await Promise.all(
    lessonRows.map(async (l) => ({ ...l, blocks: await getBlocksByLesson(l.id) }))
  );
  return { ...course, lessons: lessonsWithBlocks };
}
