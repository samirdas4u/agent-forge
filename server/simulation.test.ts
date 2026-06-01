import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock DB functions
vi.mock("./db", () => ({
  getScenarios: vi.fn().mockResolvedValue([
    { id: 1, title: "Test Scenario", category: "sales", difficulty: "beginner", systemPrompt: "You are a test AI.", isActive: true, tags: [], estimatedMinutes: 10, aiPersona: "Test Persona", description: "A test scenario", createdAt: new Date(), updatedAt: new Date() },
  ]),
  getScenarioById: vi.fn().mockResolvedValue({
    id: 1, title: "Test Scenario", category: "sales", difficulty: "beginner", systemPrompt: "You are a test AI.", isActive: true, tags: [], estimatedMinutes: 10, aiPersona: "Test Persona", description: "A test scenario", createdAt: new Date(), updatedAt: new Date(),
  }),
  createSession: vi.fn().mockResolvedValue(42),
  getSessionById: vi.fn().mockResolvedValue({
    id: 42, userId: 1, scenarioId: 1, status: "active", overallScore: null, clarityScore: null, empathyScore: null, persuasivenessScore: null, objectionHandlingScore: null, professionalismScore: null, feedbackSummary: null, strengths: [], improvements: [], durationSeconds: null, startedAt: new Date(), completedAt: null,
  }),
  getSessionMessages: vi.fn().mockResolvedValue([]),
  getUserSessions: vi.fn().mockResolvedValue([]),
  addMessage: vi.fn().mockResolvedValue(1),
  updateSession: vi.fn().mockResolvedValue(undefined),
  getWalkthroughs: vi.fn().mockResolvedValue([]),
  getWalkthroughById: vi.fn().mockResolvedValue(null),
  getOrCreateWalkthroughCompletion: vi.fn().mockResolvedValue({ id: 1, userId: 1, walkthroughId: 1, completedSteps: [], isCompleted: false, score: null, completedAt: null, startedAt: new Date() }),
  updateWalkthroughCompletion: vi.fn().mockResolvedValue(undefined),
  getUserWalkthroughCompletions: vi.fn().mockResolvedValue([]),
  getUserAnalytics: vi.fn().mockResolvedValue({ totalSessions: 0, avgScore: 0, categoryBreakdown: {}, recentSessions: [] }),
  upsertUser: vi.fn().mockResolvedValue(undefined),
  getUserByOpenId: vi.fn().mockResolvedValue(undefined),
}));

// Mock LLM
vi.mock("./_core/llm", () => ({
  invokeLLM: vi.fn().mockResolvedValue({
    choices: [{ message: { content: "Hello! How can I help you today?" } }],
  }),
}));

function createCtx(userId?: number): TrpcContext {
  const user = userId
    ? { id: userId, openId: "test-user", email: "test@example.com", name: "Test User", loginMethod: "manus", role: "user" as const, createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() }
    : null;
  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

describe("scenarios.list", () => {
  it("returns a list of scenarios", async () => {
    const caller = appRouter.createCaller(createCtx());
    const result = await caller.scenarios.list({});
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });
});

describe("scenarios.get", () => {
  it("returns a scenario by id", async () => {
    const caller = appRouter.createCaller(createCtx());
    const result = await caller.scenarios.get({ id: 1 });
    expect(result.id).toBe(1);
    expect(result.title).toBe("Test Scenario");
  });
});

describe("sessions.create", () => {
  it("creates a session for authenticated user", async () => {
    const caller = appRouter.createCaller(createCtx(1));
    const result = await caller.sessions.create({ scenarioId: 1 });
    expect(result.sessionId).toBe(42);
  });

  it("creates a session for unauthenticated user (platform is fully public)", async () => {
    const caller = appRouter.createCaller(createCtx());
    // Platform is fully public — no login required, sessions use userId=0 for guests
    const result = await caller.sessions.create({ scenarioId: 1 });
    expect(result.sessionId).toBeDefined();
  });
});

describe("sessions.list", () => {
  it("returns sessions for authenticated user", async () => {
    const caller = appRouter.createCaller(createCtx(1));
    const result = await caller.sessions.list();
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("analytics.dashboard", () => {
  it("returns analytics for authenticated user", async () => {
    const caller = appRouter.createCaller(createCtx(1));
    const result = await caller.analytics.dashboard();
    expect(result).toBeDefined();
    expect(typeof result?.totalSessions).toBe("number");
  });
});

describe("walkthroughs.myCompletions", () => {
  it("returns completions for authenticated user", async () => {
    const caller = appRouter.createCaller(createCtx(1));
    const result = await caller.walkthroughs.myCompletions();
    expect(Array.isArray(result)).toBe(true);
  });
});
