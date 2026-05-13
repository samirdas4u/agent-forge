import AppLayout from "@/components/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import {
  AlignLeft,
  ArrowLeft,
  BookOpen,
  ChevronDown,
  ChevronRight,
  Download,
  Eye,
  Globe,
  Lightbulb,
  Loader2,
  MessageSquare,
  Plus,
  RefreshCw,
  Settings,
  Sparkles,
  Star,
  Trash2,
  X,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Link, useLocation, useParams } from "wouter";

// ── Block renderers ──────────────────────────────────────────────────────────

function TextBlock({ content, onEdit }: { content: any; onEdit: (c: any) => void }) {
  const [editing, setEditing] = useState(false);
  const [html, setHtml] = useState(content.html ?? "");
  return (
    <div className="group relative">
      {editing ? (
        <div>
          <textarea
            className="w-full min-h-[120px] p-3 text-sm border border-violet-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-400 resize-none font-mono"
            value={html}
            onChange={(e) => setHtml(e.target.value)}
          />
          <div className="flex gap-2 mt-2">
            <Button size="sm" className="bg-violet-600 text-white text-xs" onClick={() => { onEdit({ html }); setEditing(false); }}>Save</Button>
            <Button size="sm" variant="ghost" className="text-xs" onClick={() => setEditing(false)}>Cancel</Button>
          </div>
        </div>
      ) : (
        <div
          className="prose prose-sm max-w-none text-gray-700 cursor-pointer hover:bg-gray-50 rounded-xl p-3 -m-3 transition-colors"
          dangerouslySetInnerHTML={{ __html: content.html ?? "<p>Click to edit...</p>" }}
          onClick={() => setEditing(true)}
        />
      )}
    </div>
  );
}

function KeyConceptBlock({ content, onEdit }: { content: any; onEdit: (c: any) => void }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ term: content.term ?? "", definition: content.definition ?? "", example: content.example ?? "" });
  return (
    <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl p-5 border border-violet-100">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-5 h-5 rounded-full bg-violet-500 flex items-center justify-center">
          <Star className="w-3 h-3 text-white fill-white" />
        </div>
        <span className="text-xs font-bold uppercase tracking-widest text-violet-600">Key Concept</span>
      </div>
      {editing ? (
        <div className="space-y-2">
          <input className="w-full px-3 py-2 text-sm border border-violet-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-400" placeholder="Term" value={form.term} onChange={(e) => setForm(f => ({ ...f, term: e.target.value }))} />
          <textarea className="w-full px-3 py-2 text-sm border border-violet-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-400 resize-none" rows={2} placeholder="Definition" value={form.definition} onChange={(e) => setForm(f => ({ ...f, definition: e.target.value }))} />
          <input className="w-full px-3 py-2 text-sm border border-violet-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-400" placeholder="Example (optional)" value={form.example} onChange={(e) => setForm(f => ({ ...f, example: e.target.value }))} />
          <div className="flex gap-2 pt-1">
            <Button size="sm" className="bg-violet-600 text-white text-xs" onClick={() => { onEdit(form); setEditing(false); }}>Save</Button>
            <Button size="sm" variant="ghost" className="text-xs" onClick={() => setEditing(false)}>Cancel</Button>
          </div>
        </div>
      ) : (
        <div className="cursor-pointer" onClick={() => setEditing(true)}>
          <div className="font-bold text-gray-900 text-base mb-1">{content.term}</div>
          <div className="text-gray-600 text-sm leading-relaxed">{content.definition}</div>
          {content.example && <div className="text-gray-400 text-xs mt-2 italic">Example: {content.example}</div>}
        </div>
      )}
    </div>
  );
}

function QuizBlock({ content, onEdit }: { content: any; onEdit: (c: any) => void }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    question: content.question ?? "",
    options: content.options ?? ["", "", "", ""],
    correct: content.correct ?? 0,
    explanation: content.explanation ?? "",
  });
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
          <MessageSquare className="w-3 h-3 text-white" />
        </div>
        <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">Knowledge Check</span>
      </div>
      {editing ? (
        <div className="space-y-2">
          <textarea className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-400 resize-none" rows={2} placeholder="Question" value={form.question} onChange={(e) => setForm(f => ({ ...f, question: e.target.value }))} />
          {form.options.map((opt: string, i: number) => (
            <div key={i} className="flex items-center gap-2">
              <input type="radio" name="correct" checked={form.correct === i} onChange={() => setForm(f => ({ ...f, correct: i }))} className="accent-violet-600" />
              <input className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-400" placeholder={`Option ${i + 1}`} value={opt} onChange={(e) => setForm(f => { const o = [...f.options]; o[i] = e.target.value; return { ...f, options: o }; })} />
            </div>
          ))}
          <textarea className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-400 resize-none" rows={2} placeholder="Explanation" value={form.explanation} onChange={(e) => setForm(f => ({ ...f, explanation: e.target.value }))} />
          <div className="flex gap-2 pt-1">
            <Button size="sm" className="bg-violet-600 text-white text-xs" onClick={() => { onEdit(form); setEditing(false); }}>Save</Button>
            <Button size="sm" variant="ghost" className="text-xs" onClick={() => setEditing(false)}>Cancel</Button>
          </div>
        </div>
      ) : (
        <div className="cursor-pointer" onClick={() => setEditing(true)}>
          <div className="font-semibold text-gray-900 text-sm mb-3">{content.question}</div>
          <div className="space-y-1.5">
            {(content.options ?? []).map((opt: string, i: number) => (
              <div key={i} className={`px-3 py-2 rounded-lg text-sm border ${i === content.correct ? "border-emerald-200 bg-emerald-50 text-emerald-800 font-medium" : "border-gray-100 text-gray-600"}`}>
                {i === content.correct && "✓ "}{opt}
              </div>
            ))}
          </div>
          {content.explanation && <div className="mt-3 text-xs text-gray-400 italic">{content.explanation}</div>}
        </div>
      )}
    </div>
  );
}

function SummaryBlock({ content, onEdit }: { content: any; onEdit: (c: any) => void }) {
  const [editing, setEditing] = useState(false);
  const [points, setPoints] = useState<string[]>(content.points ?? []);
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <AlignLeft className="w-4 h-4 text-gray-500" />
        <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Summary</span>
      </div>
      {editing ? (
        <div className="space-y-2">
          {points.map((p, i) => (
            <div key={i} className="flex gap-2">
              <input className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-400" value={p} onChange={(e) => setPoints(pts => { const n = [...pts]; n[i] = e.target.value; return n; })} />
              <button onClick={() => setPoints(pts => pts.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-600"><X className="w-4 h-4" /></button>
            </div>
          ))}
          <button onClick={() => setPoints(p => [...p, ""])} className="text-xs text-violet-600 hover:underline">+ Add point</button>
          <div className="flex gap-2 pt-1">
            <Button size="sm" className="bg-violet-600 text-white text-xs" onClick={() => { onEdit({ points }); setEditing(false); }}>Save</Button>
            <Button size="sm" variant="ghost" className="text-xs" onClick={() => setEditing(false)}>Cancel</Button>
          </div>
        </div>
      ) : (
        <ul className="space-y-2 cursor-pointer" onClick={() => setEditing(true)}>
          {(content.points ?? []).map((p: string, i: number) => (
            <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400 mt-2 flex-shrink-0" />
              {p}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function CalloutBlock({ content, onEdit }: { content: any; onEdit: (c: any) => void }) {
  const typeStyles: Record<string, string> = {
    tip: "border-amber-200 bg-amber-50",
    warning: "border-orange-200 bg-orange-50",
    info: "border-blue-200 bg-blue-50",
  };
  const typeIcons: Record<string, string> = { tip: "💡", warning: "⚠️", info: "ℹ️" };
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ type: content.type ?? "info", title: content.title ?? "", body: content.body ?? "" });
  return (
    <div className={`border rounded-xl p-5 ${typeStyles[form.type] ?? typeStyles.info}`}>
      {editing ? (
        <div className="space-y-2">
          <select className="px-3 py-2 text-sm border border-gray-200 rounded-lg" value={form.type} onChange={(e) => setForm(f => ({ ...f, type: e.target.value }))}>
            <option value="tip">💡 Tip</option>
            <option value="warning">⚠️ Warning</option>
            <option value="info">ℹ️ Info</option>
          </select>
          <input className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-400" placeholder="Title" value={form.title} onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))} />
          <textarea className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-400 resize-none" rows={3} placeholder="Body" value={form.body} onChange={(e) => setForm(f => ({ ...f, body: e.target.value }))} />
          <div className="flex gap-2 pt-1">
            <Button size="sm" className="bg-violet-600 text-white text-xs" onClick={() => { onEdit(form); setEditing(false); }}>Save</Button>
            <Button size="sm" variant="ghost" className="text-xs" onClick={() => setEditing(false)}>Cancel</Button>
          </div>
        </div>
      ) : (
        <div className="cursor-pointer" onClick={() => setEditing(true)}>
          <div className="font-semibold text-sm mb-1">{typeIcons[content.type ?? "info"]} {content.title}</div>
          <div className="text-sm text-gray-600 leading-relaxed">{content.body}</div>
        </div>
      )}
    </div>
  );
}

// ── AI Refine Panel ──────────────────────────────────────────────────────────

const AI_ACTIONS = [
  { id: "simplify", icon: <Zap className="w-3.5 h-3.5" />, label: "Simplify language", desc: "Make it clearer and jargon-free" },
  { id: "add_example", icon: <Lightbulb className="w-3.5 h-3.5" />, label: "Add real-world example", desc: "Illustrate the concept with a scenario" },
  { id: "rewrite_learner", icon: <BookOpen className="w-3.5 h-3.5" />, label: "Rewrite for learners", desc: "Adapt tone for adult learners" },
  { id: "improve_readability", icon: <AlignLeft className="w-3.5 h-3.5" />, label: "Improve readability", desc: "Shorter sentences, active voice" },
  { id: "add_quiz", icon: <MessageSquare className="w-3.5 h-3.5" />, label: "Add knowledge check", desc: "Insert a quiz after this block" },
  { id: "summarise", icon: <AlignLeft className="w-3.5 h-3.5" />, label: "Write a summary", desc: "Summarise the key points" },
  { id: "align_objectives", icon: <Star className="w-3.5 h-3.5" />, label: "Align to objectives", desc: "Check content matches learning goals" },
] as const;

type AIAction = typeof AI_ACTIONS[number]["id"];

// ── Main Editor ──────────────────────────────────────────────────────────────

export default function CourseEditor() {
  const { id } = useParams<{ id: string }>();
  const courseId = parseInt(id ?? "0");
  const [, navigate] = useLocation();
  const [selectedLessonIdx, setSelectedLessonIdx] = useState(0);
  const [aiPanelOpen, setAiPanelOpen] = useState(true);
  const [selectedBlockId, setSelectedBlockId] = useState<number | null>(null);
  const [refining, setRefining] = useState(false);
  const [scormOpen, setScormOpen] = useState(false);
  const [exporting, setExporting] = useState(false);

  const { data: course, isLoading, refetch } = trpc.courses.get.useQuery({ id: courseId });

  const updateBlockMutation = trpc.courses.updateBlock.useMutation({
    onSuccess: () => refetch(),
    onError: () => toast.error("Failed to save block"),
  });

  const refineBlockMutation = trpc.courses.refineBlock.useMutation({
    onSuccess: () => { toast.success("Block refined with AI!"); refetch(); setRefining(false); },
    onError: () => { toast.error("AI refinement failed"); setRefining(false); },
  });

  const publishMutation = trpc.courses.update.useMutation({
    onSuccess: () => { toast.success("Course published! Shareable link is active."); refetch(); },
    onError: () => toast.error("Failed to publish"),
  });

  const exportScorm = trpc.courses.exportScorm.useMutation({
    onSuccess: ({ base64, filename }) => {
      const blob = new Blob([Uint8Array.from(atob(base64), c => c.charCodeAt(0))], { type: "application/zip" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = filename; a.click();
      URL.revokeObjectURL(url);
      toast.success(`Downloaded ${filename}`);
      setExporting(false);
      setScormOpen(false);
    },
    onError: () => { toast.error("SCORM export failed"); setExporting(false); },
  });

  if (isLoading) {
    return (
      <AppLayout fullscreen>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
        </div>
      </AppLayout>
    );
  }

  if (!course) {
    return (
      <AppLayout>
        <div className="p-8 text-center text-gray-500">Course not found.</div>
      </AppLayout>
    );
  }

  const currentLesson = course.lessons[selectedLessonIdx];
  const selectedBlock = currentLesson?.blocks.find(b => b.id === selectedBlockId);

  const handleBlockEdit = (blockId: number, content: unknown) => {
    updateBlockMutation.mutate({ id: blockId, content });
  };

  const handleRefine = (action: AIAction) => {
    if (!selectedBlockId || !selectedBlock) {
      toast.error("Select a block first by clicking on it");
      return;
    }
    setRefining(true);
    refineBlockMutation.mutate({
      blockId: selectedBlockId,
      action,
      currentContent: selectedBlock.content,
      blockType: selectedBlock.blockType,
      lessonTitle: currentLesson?.title ?? "",
      lessonObjectives: currentLesson?.objectives ?? undefined,
    });
  };

  const handleExportScorm = (version: "1.2" | "2004-3rd" | "2004-4th") => {
    setExporting(true);
    exportScorm.mutate({ courseId, version });
  };

  return (
    <AppLayout fullscreen>
      <div className="flex h-full overflow-hidden bg-gray-50">
        {/* ── Left sidebar: lesson outline ── */}
        <div className="w-64 bg-[#1e1b4b] text-white flex flex-col flex-shrink-0 overflow-hidden">
          {/* Back */}
          <div className="px-4 py-3 border-b border-white/10">
            <Link href="/courses">
              <button className="flex items-center gap-1.5 text-xs text-white/60 hover:text-white transition-colors">
                <ArrowLeft className="w-3.5 h-3.5" /> All Courses
              </button>
            </Link>
          </div>

          {/* Course title */}
          <div className="px-4 py-4 border-b border-white/10">
            <div className="flex items-center gap-2 mb-1">
              <Badge className={`text-[10px] px-1.5 py-0 ${course.status === "published" ? "bg-green-500/20 text-green-300 border-green-500/30" : "bg-amber-500/20 text-amber-300 border-amber-500/30"}`}>
                {course.status}
              </Badge>
            </div>
            <h2 className="text-sm font-bold text-white leading-snug line-clamp-2">{course.title}</h2>
          </div>

          {/* Lessons */}
          <div className="flex-1 overflow-y-auto py-3">
            <div className="px-4 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">OUTLINE</span>
            </div>
            {course.lessons.map((lesson, idx) => (
              <button
                key={lesson.id}
                onClick={() => { setSelectedLessonIdx(idx); setSelectedBlockId(null); }}
                className={`w-full text-left px-4 py-3 text-xs transition-all ${
                  idx === selectedLessonIdx
                    ? "bg-violet-600/40 text-white border-l-2 border-violet-400"
                    : "text-white/60 hover:text-white hover:bg-white/5 border-l-2 border-transparent"
                }`}
              >
                <div className="font-semibold mb-0.5 line-clamp-1">{idx + 1}. {lesson.title}</div>
                <div className="text-[10px] text-white/40">{lesson.blocks.length} blocks</div>
              </button>
            ))}
          </div>

          {/* Bottom actions */}
          <div className="p-4 border-t border-white/10 space-y-2">
            <Button
              size="sm"
              className="w-full text-xs bg-white/10 hover:bg-white/20 text-white border-0 gap-1.5"
              onClick={() => navigate(`/learn/${course.slug}`)}
            >
              <Eye className="w-3.5 h-3.5" /> Preview
            </Button>
            <Button
              size="sm"
              className="w-full text-xs bg-violet-600 hover:bg-violet-500 text-white gap-1.5"
              onClick={() => {
                if (course.status === "published") {
                  navigator.clipboard.writeText(`${window.location.origin}/learn/${course.slug}`);
                  toast.success("Learner URL copied!");
                } else {
                  publishMutation.mutate({ id: courseId, status: "published" });
                }
              }}
            >
              <Globe className="w-3.5 h-3.5" />
              {course.status === "published" ? "Copy URL" : "Publish"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="w-full text-xs border-white/20 text-white/70 hover:text-white hover:bg-white/10 gap-1.5"
              onClick={() => setScormOpen(true)}
            >
              <Download className="w-3.5 h-3.5" /> Export SCORM
            </Button>
          </div>
        </div>

        {/* ── Center: block editor ── */}
        <div className="flex-1 overflow-y-auto">
          {currentLesson ? (
            <div className="max-w-2xl mx-auto px-8 py-8">
              {/* Lesson header */}
              <div className="mb-6">
                <div className="text-xs font-bold uppercase tracking-widest text-violet-500 mb-1">
                  Lesson {selectedLessonIdx + 1} of {course.lessons.length}
                </div>
                <h1 className="text-2xl font-bold text-gray-900">{currentLesson.title}</h1>
                {currentLesson.objectives && (
                  <p className="text-sm text-gray-500 mt-2 leading-relaxed">{currentLesson.objectives}</p>
                )}
              </div>

              {/* Blocks */}
              <div className="space-y-4">
                {currentLesson.blocks.map((block) => {
                  const isSelected = block.id === selectedBlockId;
                  return (
                    <div
                      key={block.id}
                      className={`relative rounded-2xl border-2 transition-all cursor-pointer ${
                        isSelected ? "border-violet-400 shadow-md shadow-violet-100" : "border-transparent hover:border-gray-200"
                      }`}
                      onClick={() => setSelectedBlockId(block.id)}
                    >
                      {/* Block type label */}
                      {isSelected && (
                        <div className="absolute -top-2.5 left-3 flex items-center gap-1.5">
                          <span className="bg-violet-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                            {block.blockType.replace("_", " ")}
                          </span>
                          <span className="bg-white text-gray-400 text-[10px] px-2 py-0.5 rounded-full border border-gray-200">
                            Click AI panel to refine →
                          </span>
                        </div>
                      )}

                      <div className="p-4">
                        {block.blockType === "text" && (
                          <TextBlock content={block.content as any} onEdit={(c) => handleBlockEdit(block.id, c)} />
                        )}
                        {block.blockType === "key_concept" && (
                          <KeyConceptBlock content={block.content as any} onEdit={(c) => handleBlockEdit(block.id, c)} />
                        )}
                        {block.blockType === "quiz" && (
                          <QuizBlock content={block.content as any} onEdit={(c) => handleBlockEdit(block.id, c)} />
                        )}
                        {block.blockType === "summary" && (
                          <SummaryBlock content={block.content as any} onEdit={(c) => handleBlockEdit(block.id, c)} />
                        )}
                        {block.blockType === "callout" && (
                          <CalloutBlock content={block.content as any} onEdit={(c) => handleBlockEdit(block.id, c)} />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Add block placeholder */}
              <div className="mt-6 border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center text-gray-400 hover:border-violet-300 hover:text-violet-500 transition-all cursor-pointer group">
                <Plus className="w-5 h-5 mx-auto mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-medium">Add Content Block</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              <div className="text-center">
                <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-200" />
                <p className="text-sm">Select a lesson from the outline</p>
              </div>
            </div>
          )}
        </div>

        {/* ── Right: AI assistant panel ── */}
        <div className={`flex-shrink-0 transition-all duration-300 ${aiPanelOpen ? "w-72" : "w-12"} bg-white border-l border-gray-100 flex flex-col overflow-hidden`}>
          {/* Toggle */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            {aiPanelOpen && (
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-violet-100 flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5 text-violet-600" />
                </div>
                <span className="text-sm font-bold text-gray-900">AI Assistant</span>
              </div>
            )}
            <button
              onClick={() => setAiPanelOpen(!aiPanelOpen)}
              className="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors ml-auto"
            >
              {aiPanelOpen ? <X className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
            </button>
          </div>

          {aiPanelOpen && (
            <div className="flex-1 overflow-y-auto p-4">
              {/* Current block indicator */}
              <div className="mb-4 p-3 bg-gray-50 rounded-xl">
                <div className="text-xs text-gray-400 mb-0.5">Current lesson</div>
                <div className="text-sm font-semibold text-gray-800 line-clamp-1">{currentLesson?.title ?? "—"}</div>
                {selectedBlockId && (
                  <div className="text-xs text-violet-600 mt-1 flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-violet-500" />
                    Block selected
                  </div>
                )}
              </div>

              {/* Generate content button */}
              <Button
                className="w-full bg-violet-600 hover:bg-violet-700 text-white text-xs gap-1.5 mb-4"
                size="sm"
                disabled={refining}
                onClick={() => handleRefine("rewrite_learner")}
              >
                {refining ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                Refine with AI
              </Button>

              {/* Quick actions */}
              <div className="mb-3">
                <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">QUICK ACTIONS</div>
                <div className="space-y-1">
                  {AI_ACTIONS.map((action) => (
                    <button
                      key={action.id}
                      disabled={refining || !selectedBlockId}
                      onClick={() => handleRefine(action.id as AIAction)}
                      className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-violet-50 hover:text-violet-700 transition-all group disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-gray-400 group-hover:text-violet-500 transition-colors">{action.icon}</span>
                        <span className="text-xs font-semibold text-gray-700 group-hover:text-violet-700">{action.label}</span>
                      </div>
                      <div className="text-[10px] text-gray-400 pl-5">{action.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Hint */}
              {!selectedBlockId && (
                <div className="mt-4 p-3 bg-amber-50 border border-amber-100 rounded-xl">
                  <div className="text-xs font-bold text-amber-700 mb-1">💡 Didactics Hint</div>
                  <div className="text-[11px] text-amber-600 leading-relaxed">
                    Click any block in the editor to select it, then use the quick actions above to refine it with AI.
                  </div>
                </div>
              )}

              {refining && (
                <div className="mt-4 p-3 bg-violet-50 border border-violet-100 rounded-xl">
                  <div className="flex items-center gap-2 text-xs text-violet-700">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    AI is refining this block...
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* SCORM Export Modal */}
      {scormOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Export as SCORM</h3>
                <p className="text-sm text-gray-500 mt-0.5">Download a SCORM-compliant ZIP for your LMS</p>
              </div>
              <button onClick={() => setScormOpen(false)} className="text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {[
                { version: "1.2" as const, label: "SCORM 1.2", desc: "Compatible with Moodle, SCORM Cloud, most LMS platforms", badge: "Most Compatible" },
                { version: "2004-3rd" as const, label: "SCORM 2004 (3rd Edition)", desc: "Advanced sequencing, xAPI-ready LMS platforms", badge: "Recommended" },
                { version: "2004-4th" as const, label: "SCORM 2004 (4th Edition)", desc: "Latest standard, Cornerstone, SAP SuccessFactors", badge: "Latest" },
              ].map(({ version, label, desc, badge }) => (
                <button
                  key={version}
                  disabled={exporting}
                  onClick={() => handleExportScorm(version)}
                  className="w-full text-left p-4 rounded-xl border border-gray-200 hover:border-violet-300 hover:bg-violet-50 transition-all group disabled:opacity-50"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-sm text-gray-900 group-hover:text-violet-700">{label}</span>
                    <span className="text-[10px] bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full font-bold">{badge}</span>
                  </div>
                  <p className="text-xs text-gray-500">{desc}</p>
                </button>
              ))}
            </div>

            {exporting && (
              <div className="mt-4 flex items-center gap-2 text-sm text-violet-600">
                <Loader2 className="w-4 h-4 animate-spin" />
                Building SCORM package...
              </div>
            )}
          </div>
        </div>
      )}
    </AppLayout>
  );
}
