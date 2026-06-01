import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { invokeLLM } from "../_core/llm";
import {
  createContentBlock,
  createCourse,
  createLesson,
  deleteContentBlock,
  deleteCourse,
  deleteLesson,
  getBlocksByLesson,
  getCourseFull,
  getCourseById,
  getCourseBySlug,
  getLessonsByCourse,
  getOrCreateEnrollment,
  getUserCourses,
  updateContentBlock,
  updateCourse,
  updateEnrollment,
  updateLesson,
} from "../db";
import { nanoid } from "nanoid";
import JSZip from "jszip";

// ── Helpers ──────────────────────────────────────────────────────────────────

function slugify(title: string): string {
  return (
    title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .slice(0, 60) +
    "-" +
    nanoid(6)
  );
}

async function extractTextFromBuffer(
  buffer: Buffer,
  mimeType: string
): Promise<string> {
  if (mimeType === "application/pdf" || mimeType === "pdf") {
    const pdfParseModule = await import("pdf-parse");
    const pdfParse = (pdfParseModule as any).default ?? pdfParseModule;
    const data = await pdfParse(buffer);
    return data.text;
  }
  if (
    mimeType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    mimeType === "docx"
  ) {
    const mammoth = await import("mammoth");
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }
  // PPTX: treat as plain text (basic extraction)
  return buffer.toString("utf-8").replace(/[^\x20-\x7E\n]/g, " ");
}

async function generateCourseFromText(
  rawText: string,
  title: string
): Promise<{
  description: string;
  estimatedMinutes: number;
  lessons: Array<{
    title: string;
    objectives: string;
    blocks: Array<{
      blockType: "text" | "key_concept" | "quiz" | "summary" | "callout";
      content: unknown;
    }>;
  }>;
}> {
  const truncated = rawText.slice(0, 12000);
  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: `You are an expert eLearning instructional designer. Convert the provided source document into a structured eLearning course. Return ONLY valid JSON matching the schema exactly.`,
      },
      {
        role: "user",
        content: `Source document title: "${title}"\n\nSource content:\n${truncated}\n\nConvert this into an eLearning course JSON with this exact schema:
{
  "description": "string (2-3 sentences describing the course)",
  "estimatedMinutes": number,
  "lessons": [
    {
      "title": "string",
      "objectives": "string (1-2 learning objectives)",
      "blocks": [
        {
          "blockType": "text" | "key_concept" | "quiz" | "summary" | "callout",
          "content": {
            // For text: { "html": "string with <p>, <ul>, <strong> tags" }
            // For key_concept: { "term": "string", "definition": "string", "example": "string" }
            // For quiz: { "question": "string", "options": ["A", "B", "C", "D"], "correct": 0, "explanation": "string" }
            // For summary: { "points": ["string", "string", "string"] }
            // For callout: { "type": "tip" | "warning" | "info", "title": "string", "body": "string" }
          }
        }
      ]
    }
  ]
}

Rules:
- Create 3-6 lessons from the content
- Each lesson should have 3-6 blocks
- Include at least 1 quiz block per lesson
- Include at least 1 key_concept block per lesson
- End each lesson with a summary block
- Keep content accurate to the source material`,
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "course_structure",
        strict: true,
        schema: {
          type: "object",
          properties: {
            description: { type: "string" },
            estimatedMinutes: { type: "integer" },
            lessons: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  objectives: { type: "string" },
                  blocks: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        blockType: {
                          type: "string",
                          enum: [
                            "text",
                            "key_concept",
                            "quiz",
                            "summary",
                            "callout",
                          ],
                        },
                        content: { type: "object", additionalProperties: true },
                      },
                      required: ["blockType", "content"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["title", "objectives", "blocks"],
                additionalProperties: false,
              },
            },
          },
          required: ["description", "estimatedMinutes", "lessons"],
          additionalProperties: false,
        },
      },
    },
  });

  const raw = response.choices[0]?.message?.content ?? "{}";
  return JSON.parse(typeof raw === "string" ? raw : JSON.stringify(raw));
}

// ── SCORM Builders ────────────────────────────────────────────────────────────

function buildScormManifest(
  courseId: string,
  title: string,
  version: "1.2" | "2004-3rd" | "2004-4th"
): string {
  if (version === "1.2") {
    return `<?xml version="1.0" encoding="UTF-8"?>
<manifest identifier="${courseId}" version="1"
  xmlns="http://www.imsproject.org/xsd/imscp_rootv1p1p2"
  xmlns:adlcp="http://www.adlnet.org/xsd/adlcp_rootv1p2"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.imsproject.org/xsd/imscp_rootv1p1p2 imscp_rootv1p1p2.xsd
    http://www.adlnet.org/xsd/adlcp_rootv1p2 adlcp_rootv1p2.xsd">
  <metadata>
    <schema>ADL SCORM</schema>
    <schemaversion>1.2</schemaversion>
  </metadata>
  <organizations default="org_${courseId}">
    <organization identifier="org_${courseId}">
      <title>${escapeXml(title)}</title>
      <item identifier="item_1" identifierref="res_1" isvisible="true">
        <title>${escapeXml(title)}</title>
        <adlcp:masteryscore>80</adlcp:masteryscore>
      </item>
    </organization>
  </organizations>
  <resources>
    <resource identifier="res_1" type="webcontent" adlcp:scormtype="sco" href="index.html">
      <file href="index.html"/>
      <file href="scorm_api.js"/>
    </resource>
  </resources>
</manifest>`;
  }

  const ns =
    version === "2004-3rd"
      ? "http://www.imsglobal.org/xsd/imscp_v1p1"
      : "http://www.imsglobal.org/xsd/imscp_v1p1";
  const adlns =
    version === "2004-3rd"
      ? "http://www.adlnet.org/xsd/adlcp_v1p3p2"
      : "http://www.adlnet.org/xsd/adlcp_v1p3p2";
  const schemaVer = version === "2004-3rd" ? "SCORM 2004 3rd Edition" : "SCORM 2004 4th Edition";

  return `<?xml version="1.0" encoding="UTF-8"?>
<manifest identifier="${courseId}" version="1"
  xmlns="${ns}"
  xmlns:adlcp="${adlns}"
  xmlns:adlseq="http://www.adlnet.org/xsd/adlseq_v1p3p2"
  xmlns:adlnav="http://www.adlnet.org/xsd/adlnav_v1p3p2"
  xmlns:imsss="http://www.imsglobal.org/xsd/imsss"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <metadata>
    <schema>ADL SCORM</schema>
    <schemaversion>${schemaVer}</schemaversion>
  </metadata>
  <organizations default="org_${courseId}">
    <organization identifier="org_${courseId}">
      <title>${escapeXml(title)}</title>
      <item identifier="item_1" identifierref="res_1">
        <title>${escapeXml(title)}</title>
        <imsss:sequencing>
          <imsss:objectives>
            <imsss:primaryObjective objectiveID="obj_1" satisfiedByMeasure="true">
              <imsss:minNormalizedMeasure>0.8</imsss:minNormalizedMeasure>
            </imsss:primaryObjective>
          </imsss:objectives>
        </imsss:sequencing>
      </item>
    </organization>
  </organizations>
  <resources>
    <resource identifier="res_1" type="webcontent" adlcp:scormType="sco" href="index.html">
      <file href="index.html"/>
      <file href="scorm_api.js"/>
    </resource>
  </resources>
</manifest>`;
}

function escapeXml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function buildScormApiJs(version: "1.2" | "2004-3rd" | "2004-4th"): string {
  if (version === "1.2") {
    return `// SCORM 1.2 API Wrapper
var API = null;
function findAPI(win) {
  var attempts = 0;
  while (!win.API && win.parent && win.parent !== win && attempts < 7) {
    win = win.parent; attempts++;
  }
  return win.API || null;
}
function initSCORM() { API = findAPI(window); if (API) API.LMSInitialize(""); }
function setSCORMValue(key, val) { if (API) API.LMSSetValue(key, val); }
function getSCORMValue(key) { return API ? API.LMSGetValue(key) : ""; }
function commitSCORM() { if (API) API.LMSCommit(""); }
function finishSCORM(status) {
  if (API) {
    API.LMSSetValue("cmi.core.lesson_status", status || "passed");
    API.LMSSetValue("cmi.core.score.raw", "100");
    API.LMSCommit("");
    API.LMSFinish("");
  }
}
window.addEventListener("load", initSCORM);
window.addEventListener("beforeunload", function() { commitSCORM(); });`;
  }
  return `// SCORM 2004 API Wrapper
var API_1484_11 = null;
function findAPI(win) {
  var attempts = 0;
  while (!win.API_1484_11 && win.parent && win.parent !== win && attempts < 7) {
    win = win.parent; attempts++;
  }
  return win.API_1484_11 || null;
}
function initSCORM() { API_1484_11 = findAPI(window); if (API_1484_11) API_1484_11.Initialize(""); }
function setSCORMValue(key, val) { if (API_1484_11) API_1484_11.SetValue(key, val); }
function getSCORMValue(key) { return API_1484_11 ? API_1484_11.GetValue(key) : ""; }
function commitSCORM() { if (API_1484_11) API_1484_11.Commit(""); }
function finishSCORM(status) {
  if (API_1484_11) {
    API_1484_11.SetValue("cmi.completion_status", "completed");
    API_1484_11.SetValue("cmi.success_status", status || "passed");
    API_1484_11.SetValue("cmi.score.scaled", "1");
    API_1484_11.Commit("");
    API_1484_11.Terminate("");
  }
}
window.addEventListener("load", initSCORM);
window.addEventListener("beforeunload", function() { commitSCORM(); });`;
}

function buildScormHtml(
  course: Awaited<ReturnType<typeof getCourseFull>>,
  version: "1.2" | "2004-3rd" | "2004-4th"
): string {
  if (!course) return "<html><body>No content</body></html>";

  const lessonsHtml = course.lessons
    .map(
      (lesson, li) => `
    <div class="lesson" id="lesson-${li}" style="display:${li === 0 ? "block" : "none"}">
      <div class="lesson-header">
        <span class="lesson-num">Lesson ${li + 1} of ${course.lessons.length}</span>
        <h2>${escapeXml(lesson.title)}</h2>
        ${lesson.objectives ? `<p class="objectives"><strong>Objectives:</strong> ${escapeXml(lesson.objectives)}</p>` : ""}
      </div>
      <div class="blocks">
        ${lesson.blocks
          .map((block) => {
            const c = block.content as any;
            if (block.blockType === "text") {
              return `<div class="block block-text">${c.html ?? ""}</div>`;
            }
            if (block.blockType === "key_concept") {
              return `<div class="block block-key-concept">
                <div class="kc-label">Key Concept</div>
                <div class="kc-term">${escapeXml(c.term ?? "")}</div>
                <div class="kc-def">${escapeXml(c.definition ?? "")}</div>
                ${c.example ? `<div class="kc-example"><strong>Example:</strong> ${escapeXml(c.example)}</div>` : ""}
              </div>`;
            }
            if (block.blockType === "quiz") {
              const opts = (c.options ?? []) as string[];
              return `<div class="block block-quiz" data-correct="${c.correct ?? 0}">
                <div class="quiz-label">Knowledge Check</div>
                <div class="quiz-q">${escapeXml(c.question ?? "")}</div>
                <div class="quiz-options">
                  ${opts.map((opt, i) => `<button class="quiz-opt" onclick="checkAnswer(this, ${i})">${escapeXml(opt)}</button>`).join("")}
                </div>
                <div class="quiz-feedback" style="display:none">${escapeXml(c.explanation ?? "")}</div>
              </div>`;
            }
            if (block.blockType === "summary") {
              const pts = (c.points ?? []) as string[];
              return `<div class="block block-summary">
                <div class="sum-label">Summary</div>
                <ul>${pts.map((p) => `<li>${escapeXml(p)}</li>`).join("")}</ul>
              </div>`;
            }
            if (block.blockType === "callout") {
              return `<div class="block block-callout callout-${c.type ?? "info"}">
                <div class="callout-title">${escapeXml(c.title ?? "")}</div>
                <div class="callout-body">${escapeXml(c.body ?? "")}</div>
              </div>`;
            }
            return "";
          })
          .join("")}
      </div>
    </div>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeXml(course.title)}</title>
<script src="scorm_api.js"></script>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', system-ui, sans-serif; background: #f8f9fa; color: #1a1a2e; }
  .shell { display: flex; height: 100vh; }
  .sidebar { width: 260px; background: #1e1b4b; color: white; padding: 20px; overflow-y: auto; flex-shrink: 0; }
  .sidebar h1 { font-size: 14px; font-weight: 700; margin-bottom: 16px; line-height: 1.4; color: #c7d2fe; }
  .sidebar-item { padding: 10px 12px; border-radius: 8px; cursor: pointer; font-size: 13px; margin-bottom: 4px; color: #a5b4fc; transition: all .2s; }
  .sidebar-item:hover, .sidebar-item.active { background: rgba(139,92,246,.3); color: white; }
  .sidebar-item.done { color: #6ee7b7; }
  .main { flex: 1; overflow-y: auto; padding: 32px; }
  .lesson { max-width: 760px; margin: 0 auto; }
  .lesson-header { margin-bottom: 28px; }
  .lesson-num { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; color: #7c3aed; }
  .lesson-header h2 { font-size: 26px; font-weight: 800; margin: 6px 0 10px; color: #1e1b4b; }
  .objectives { font-size: 14px; color: #6b7280; line-height: 1.6; }
  .block { margin-bottom: 20px; border-radius: 12px; padding: 20px; }
  .block-text { background: white; border: 1px solid #e5e7eb; line-height: 1.7; font-size: 15px; }
  .block-text p { margin-bottom: 12px; } .block-text ul { padding-left: 20px; } .block-text li { margin-bottom: 6px; }
  .block-key-concept { background: linear-gradient(135deg, #ede9fe, #ddd6fe); border-left: 4px solid #7c3aed; }
  .kc-label { font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: .1em; color: #7c3aed; margin-bottom: 8px; }
  .kc-term { font-size: 18px; font-weight: 800; color: #1e1b4b; margin-bottom: 8px; }
  .kc-def { font-size: 14px; color: #374151; line-height: 1.6; }
  .kc-example { margin-top: 10px; font-size: 13px; color: #6b7280; font-style: italic; }
  .block-quiz { background: white; border: 1px solid #e5e7eb; }
  .quiz-label { font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: .1em; color: #059669; margin-bottom: 12px; }
  .quiz-q { font-size: 16px; font-weight: 700; color: #1e1b4b; margin-bottom: 16px; line-height: 1.5; }
  .quiz-options { display: flex; flex-direction: column; gap: 8px; }
  .quiz-opt { padding: 12px 16px; border: 1.5px solid #e5e7eb; border-radius: 8px; background: white; text-align: left; cursor: pointer; font-size: 14px; transition: all .15s; }
  .quiz-opt:hover { border-color: #7c3aed; background: #f5f3ff; }
  .quiz-opt.correct { border-color: #059669; background: #ecfdf5; color: #065f46; font-weight: 700; }
  .quiz-opt.wrong { border-color: #dc2626; background: #fef2f2; color: #991b1b; }
  .quiz-feedback { margin-top: 14px; padding: 12px; background: #f0fdf4; border-radius: 8px; font-size: 13px; color: #065f46; border-left: 3px solid #059669; }
  .block-summary { background: #fafafa; border: 1px solid #e5e7eb; }
  .sum-label { font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: .1em; color: #6b7280; margin-bottom: 12px; }
  .block-summary ul { padding-left: 20px; } .block-summary li { font-size: 14px; color: #374151; margin-bottom: 8px; line-height: 1.5; }
  .block-callout { border-left: 4px solid #3b82f6; }
  .callout-tip { background: #fffbeb; border-color: #f59e0b; }
  .callout-warning { background: #fff7ed; border-color: #f97316; }
  .callout-info { background: #eff6ff; border-color: #3b82f6; }
  .callout-title { font-weight: 700; font-size: 14px; margin-bottom: 6px; }
  .callout-body { font-size: 14px; color: #374151; line-height: 1.6; }
  .nav-bar { display: flex; justify-content: space-between; align-items: center; margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb; }
  .nav-btn { padding: 10px 20px; border-radius: 8px; font-size: 14px; font-weight: 700; cursor: pointer; border: none; transition: all .15s; }
  .nav-btn-prev { background: white; color: #374151; border: 1.5px solid #e5e7eb; }
  .nav-btn-next { background: linear-gradient(135deg, #7c3aed, #6d28d9); color: white; }
  .nav-btn:hover { opacity: .85; }
  .progress-bar { height: 4px; background: #e5e7eb; border-radius: 2px; margin-bottom: 24px; }
  .progress-fill { height: 100%; background: linear-gradient(90deg, #7c3aed, #6d28d9); border-radius: 2px; transition: width .4s; }
  .complete-screen { text-align: center; padding: 60px 20px; }
  .complete-screen h2 { font-size: 32px; font-weight: 900; color: #1e1b4b; margin-bottom: 12px; }
  .complete-screen p { color: #6b7280; font-size: 16px; }
</style>
</head>
<body>
<div class="shell">
  <div class="sidebar">
    <h1>${escapeXml(course.title)}</h1>
    ${course.lessons.map((l, i) => `<div class="sidebar-item${i === 0 ? " active" : ""}" id="nav-${i}" onclick="goToLesson(${i})">${i + 1}. ${escapeXml(l.title)}</div>`).join("")}
  </div>
  <div class="main">
    <div class="progress-bar"><div class="progress-fill" id="progress" style="width:${course.lessons.length > 0 ? Math.round(100 / course.lessons.length) : 0}%"></div></div>
    ${lessonsHtml}
    <div class="lesson" id="lesson-complete" style="display:none">
      <div class="complete-screen">
        <div style="font-size:64px;margin-bottom:16px">🎓</div>
        <h2>Course Complete!</h2>
        <p>You have completed "${escapeXml(course.title)}"</p>
      </div>
    </div>
    <div class="nav-bar">
      <button class="nav-btn nav-btn-prev" id="btn-prev" onclick="prevLesson()" style="display:none">← Previous</button>
      <button class="nav-btn nav-btn-next" id="btn-next" onclick="nextLesson()">Next →</button>
    </div>
  </div>
</div>
<script>
var current = 0;
var total = ${course.lessons.length};
var completed = [];
function goToLesson(idx) {
  document.querySelectorAll('.lesson').forEach(function(el) { el.style.display = 'none'; });
  var el = document.getElementById('lesson-' + idx);
  if (el) { el.style.display = 'block'; current = idx; }
  document.querySelectorAll('.sidebar-item').forEach(function(el, i) {
    el.classList.toggle('active', i === idx);
  });
  document.getElementById('btn-prev').style.display = idx > 0 ? 'inline-flex' : 'none';
  document.getElementById('btn-next').textContent = idx >= total - 1 ? 'Finish ✓' : 'Next →';
  var pct = Math.round(((idx + 1) / total) * 100);
  document.getElementById('progress').style.width = pct + '%';
  setSCORMValue('${version === "1.2" ? "cmi.core.lesson_location" : "cmi.location"}', String(idx));
  commitSCORM();
}
function nextLesson() {
  if (!completed.includes(current)) completed.push(current);
  if (current >= total - 1) {
    document.querySelectorAll('.lesson').forEach(function(el) { el.style.display = 'none'; });
    document.getElementById('lesson-complete').style.display = 'block';
    document.getElementById('btn-next').style.display = 'none';
    document.getElementById('progress').style.width = '100%';
    finishSCORM('passed');
  } else { goToLesson(current + 1); }
}
function prevLesson() { if (current > 0) goToLesson(current - 1); }
function checkAnswer(btn, idx) {
  var block = btn.closest('.block-quiz');
  var correct = parseInt(block.dataset.correct);
  block.querySelectorAll('.quiz-opt').forEach(function(b, i) {
    b.disabled = true;
    if (i === correct) b.classList.add('correct');
    else if (i === idx) b.classList.add('wrong');
  });
  block.querySelector('.quiz-feedback').style.display = 'block';
}
</script>
</body>
</html>`;
}

async function buildScormZip(
  course: Awaited<ReturnType<typeof getCourseFull>>,
  version: "1.2" | "2004-3rd" | "2004-4th"
): Promise<Buffer> {
  if (!course) throw new Error("Course not found");
  const zip = new JSZip();
  const courseId = `course_${course.id}`;
  zip.file("imsmanifest.xml", buildScormManifest(courseId, course.title, version));
  zip.file("scorm_api.js", buildScormApiJs(version));
  zip.file("index.html", buildScormHtml(course, version));
  return zip.generateAsync({ type: "nodebuffer" });
}

// ── Router ────────────────────────────────────────────────────────────────────

export const coursesRouter = router({
  // List user's courses
  list: publicProcedure.query(async ({ ctx }) => {
    return getUserCourses((ctx.user?.id ?? 0));
  }),

  // Get full course with lessons and blocks
  get: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const course = await getCourseFull(input.id);
      if (!course) throw new TRPCError({ code: "NOT_FOUND" });
      if (course.userId !== (ctx.user?.id ?? 0) && ctx.user?.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      return course;
    }),

  // Get public course by slug (for learner view)
  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const course = await getCourseBySlug(input.slug);
      if (!course || course.status !== "published")
        throw new TRPCError({ code: "NOT_FOUND" });
      return getCourseFull(course.id);
    }),

  // Create course from uploaded text
  createFromText: publicProcedure
    .input(
      z.object({
        title: z.string().min(1),
        rawText: z.string().min(10),
        sourceType: z.enum(["pdf", "docx", "pptx", "text", "url"]),
        sourceFileName: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const slug = slugify(input.title);
      const generated = await generateCourseFromText(input.rawText, input.title);
      const courseId = await createCourse({
        userId: (ctx.user?.id ?? 0),
        title: input.title,
        description: generated.description,
        sourceType: input.sourceType,
        sourceFileName: input.sourceFileName,
        slug,
        estimatedMinutes: generated.estimatedMinutes,
      });

      for (let li = 0; li < generated.lessons.length; li++) {
        const l = generated.lessons[li];
        const lessonId = await createLesson({
          courseId,
          title: l.title,
          objectives: l.objectives,
          lessonOrder: li,
        });
        for (let bi = 0; bi < l.blocks.length; bi++) {
          const b = l.blocks[bi];
          await createContentBlock({
            lessonId,
            blockType: b.blockType as any,
            content: b.content,
            blockOrder: bi,
          });
        }
      }

      return { courseId, slug };
    }),

  // Update course metadata
  update: publicProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        status: z.enum(["draft", "published"]).optional(),
        estimatedMinutes: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const course = await getCourseById(input.id);
      if (!course) throw new TRPCError({ code: "NOT_FOUND" });
      if (course.userId !== (ctx.user?.id ?? 0) && ctx.user?.role !== "admin")
        throw new TRPCError({ code: "FORBIDDEN" });
      const { id, ...data } = input;
      await updateCourse(id, data as any);
      return { success: true };
    }),

  // Delete course
  delete: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const course = await getCourseById(input.id);
      if (!course) throw new TRPCError({ code: "NOT_FOUND" });
      if (course.userId !== (ctx.user?.id ?? 0) && ctx.user?.role !== "admin")
        throw new TRPCError({ code: "FORBIDDEN" });
      await deleteCourse(input.id);
      return { success: true };
    }),

  // Update a lesson
  updateLesson: publicProcedure
    .input(z.object({ id: z.number(), title: z.string().optional(), objectives: z.string().optional() }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await updateLesson(id, data);
      return { success: true };
    }),

  // Update a content block
  updateBlock: publicProcedure
    .input(z.object({ id: z.number(), content: z.unknown() }))
    .mutation(async ({ input }) => {
      await updateContentBlock(input.id, { content: input.content });
      return { success: true };
    }),

  // Add a block to a lesson
  addBlock: publicProcedure
    .input(
      z.object({
        lessonId: z.number(),
        blockType: z.enum(["text", "key_concept", "quiz", "summary", "callout"]),
        content: z.unknown(),
        blockOrder: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      const id = await createContentBlock(input as any);
      return { id };
    }),

  // Delete a block
  deleteBlock: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await deleteContentBlock(input.id);
      return { success: true };
    }),

  // Refine a block with AI
  refineBlock: publicProcedure
    .input(
      z.object({
        blockId: z.number(),
        action: z.enum([
          "simplify",
          "add_example",
          "rewrite_learner",
          "improve_readability",
          "add_quiz",
          "summarise",
          "align_objectives",
        ]),
        currentContent: z.unknown(),
        blockType: z.string(),
        lessonTitle: z.string(),
        lessonObjectives: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const actionPrompts: Record<string, string> = {
        simplify: "Simplify this content to be clearer and easier to understand. Reduce jargon.",
        add_example: "Add a concrete real-world example that illustrates the concept.",
        rewrite_learner: "Rewrite this content in a friendly, engaging tone suitable for adult learners.",
        improve_readability: "Improve readability: use shorter sentences, active voice, and clear structure.",
        add_quiz: "Convert this content into a quiz block with a question, 4 options, correct answer index, and explanation.",
        summarise: "Summarise the key points of this content into 3-5 bullet points.",
        align_objectives: `Rewrite this content to clearly align with the lesson objectives: "${input.lessonObjectives}".`,
      };

      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content: `You are an expert eLearning instructional designer. You refine content blocks. Return ONLY valid JSON matching the original block type structure.`,
          },
          {
            role: "user",
            content: `Lesson: "${input.lessonTitle}"\nBlock type: ${input.blockType}\nCurrent content: ${JSON.stringify(input.currentContent)}\n\nAction: ${actionPrompts[input.action]}\n\nReturn the refined content as JSON matching the same block type structure.`,
          },
        ],
      });

      const raw = response.choices[0]?.message?.content ?? "{}";
      let refined: unknown;
      try {
        refined = JSON.parse(typeof raw === "string" ? raw : JSON.stringify(raw));
      } catch {
        refined = { html: `<p>${raw}</p>` };
      }

      await updateContentBlock(input.blockId, { content: refined });
      return { content: refined };
    }),

  // Export as SCORM ZIP (returns base64)
  exportScorm: publicProcedure
    .input(
      z.object({
        courseId: z.number(),
        version: z.enum(["1.2", "2004-3rd", "2004-4th"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const course = await getCourseFull(input.courseId);
      if (!course) throw new TRPCError({ code: "NOT_FOUND" });
      if (course.userId !== (ctx.user?.id ?? 0) && ctx.user?.role !== "admin")
        throw new TRPCError({ code: "FORBIDDEN" });
      const zipBuffer = await buildScormZip(course, input.version);
      return {
        base64: zipBuffer.toString("base64"),
        filename: `${course.slug ?? "course"}_scorm_${input.version}.zip`,
      };
    }),

  // Enroll and track progress
  enroll: publicProcedure
    .input(z.object({ courseId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const enrollment = await getOrCreateEnrollment((ctx.user?.id ?? 0), input.courseId);
      return enrollment;
    }),

  updateProgress: publicProcedure
    .input(
      z.object({
        enrollmentId: z.number(),
        completedLessons: z.array(z.number()),
        completedBlocks: z.array(z.number()),
        quizScores: z.record(z.string(), z.number()),
        isCompleted: z.boolean(),
      })
    )
    .mutation(async ({ input }) => {
      const { enrollmentId, ...data } = input;
      await updateEnrollment(enrollmentId, {
        ...data,
        completedAt: data.isCompleted ? new Date() : undefined,
      });
      return { success: true };
    }),
});
