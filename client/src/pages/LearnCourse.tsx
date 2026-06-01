import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import {
  AlignLeft,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  MessageSquare,
  Star,
  Trophy,
} from "lucide-react";
import { useState } from "react";
import { useParams } from "wouter";

// ── Block renderers (learner view, read-only) ────────────────────────────────

function TextBlock({ content }: { content: any }) {
  return (
    <div
      className="prose prose-sm max-w-none text-gray-700 leading-relaxed"
      dangerouslySetInnerHTML={{ __html: content.html ?? "" }}
    />
  );
}

function KeyConceptBlock({ content }: { content: any }) {
  return (
    <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl p-6 border border-violet-100">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 rounded-full bg-violet-500 flex items-center justify-center">
          <Star className="w-3.5 h-3.5 text-white fill-white" />
        </div>
        <span className="text-xs font-bold uppercase tracking-widest text-violet-600">Key Concept</span>
      </div>
      <div className="font-bold text-gray-900 text-lg mb-2">{content.term}</div>
      <div className="text-gray-600 text-sm leading-relaxed">{content.definition}</div>
      {content.example && (
        <div className="mt-3 text-xs text-gray-400 italic border-t border-violet-100 pt-3">
          <strong>Example:</strong> {content.example}
        </div>
      )}
    </div>
  );
}

function QuizBlock({ content, onAnswer }: { content: any; onAnswer: (correct: boolean) => void }) {
  const [selected, setSelected] = useState<number | null>(null);
  const answered = selected !== null;
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
          <MessageSquare className="w-3.5 h-3.5 text-white" />
        </div>
        <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">Knowledge Check</span>
      </div>
      <div className="font-semibold text-gray-900 text-base mb-4 leading-snug">{content.question}</div>
      <div className="space-y-2.5">
        {(content.options ?? []).map((opt: string, i: number) => {
          const isCorrect = i === content.correct;
          const isSelected = i === selected;
          let cls = "w-full text-left px-4 py-3 rounded-xl border text-sm transition-all ";
          if (!answered) {
            cls += "border-gray-200 hover:border-violet-300 hover:bg-violet-50 cursor-pointer";
          } else if (isCorrect) {
            cls += "border-emerald-300 bg-emerald-50 text-emerald-800 font-semibold";
          } else if (isSelected) {
            cls += "border-red-200 bg-red-50 text-red-700";
          } else {
            cls += "border-gray-100 text-gray-400";
          }
          return (
            <button
              key={i}
              disabled={answered}
              className={cls}
              onClick={() => { setSelected(i); onAnswer(isCorrect); }}
            >
              {answered && isCorrect && "✓ "}{opt}
            </button>
          );
        })}
      </div>
      {answered && content.explanation && (
        <div className="mt-4 p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-sm text-emerald-700">
          <strong>Explanation:</strong> {content.explanation}
        </div>
      )}
    </div>
  );
}

function SummaryBlock({ content }: { content: any }) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-3">
        <AlignLeft className="w-4 h-4 text-gray-500" />
        <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Summary</span>
      </div>
      <ul className="space-y-2.5">
        {(content.points ?? []).map((p: string, i: number) => (
          <li key={i} className="flex items-start gap-2.5 text-sm text-gray-700">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 mt-2 flex-shrink-0" />
            {p}
          </li>
        ))}
      </ul>
    </div>
  );
}

function CalloutBlock({ content }: { content: any }) {
  const typeStyles: Record<string, string> = {
    tip: "border-amber-200 bg-amber-50",
    warning: "border-orange-200 bg-orange-50",
    info: "border-blue-200 bg-blue-50",
  };
  const typeIcons: Record<string, string> = { tip: "💡", warning: "⚠️", info: "ℹ️" };
  return (
    <div className={`border rounded-2xl p-5 ${typeStyles[content.type ?? "info"] ?? typeStyles.info}`}>
      <div className="font-semibold text-sm mb-1.5">{typeIcons[content.type ?? "info"]} {content.title}</div>
      <div className="text-sm text-gray-600 leading-relaxed">{content.body}</div>
    </div>
  );
}

// ── Main learner view ────────────────────────────────────────────────────────

export default function LearnCourse() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const [currentLessonIdx, setCurrentLessonIdx] = useState(0);
  const [completedLessons, setCompletedLessons] = useState<number[]>([]);
  const [quizScores, setQuizScores] = useState<Record<string, number>>({});
  const [finished, setFinished] = useState(false);

  const { data: course, isLoading } = trpc.courses.getBySlug.useQuery({ slug: slug ?? "" });

  const enrollMutation = trpc.courses.enroll.useMutation();

  const handleQuizAnswer = (blockId: number, correct: boolean) => {
    setQuizScores(s => ({ ...s, [String(blockId)]: correct ? 100 : 0 }));
  };

  const handleNext = () => {
    if (!course) return;
    const lessonId = course.lessons[currentLessonIdx]?.id;
    if (lessonId) setCompletedLessons(c => Array.from(new Set([...c, lessonId])));

    if (currentLessonIdx >= course.lessons.length - 1) {
      setFinished(true);
    } else {
      setCurrentLessonIdx(i => i + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrev = () => {
    if (currentLessonIdx > 0) {
      setCurrentLessonIdx(i => i - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <h2 className="text-lg font-bold text-gray-700">Course not found</h2>
          <p className="text-gray-400 text-sm mt-1">This course may not be published yet.</p>
        </div>
      </div>
    );
  }

  const currentLesson = course.lessons[currentLessonIdx];
  const progress = Math.round(((currentLessonIdx + (finished ? 1 : 0)) / course.lessons.length) * 100);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 py-3 flex items-center gap-4">
          <div className="flex-1">
            <div className="text-xs font-bold text-gray-900 truncate">{course.title}</div>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-xs text-gray-400 flex-shrink-0">{progress}%</span>
            </div>
          </div>
          <div className="text-xs text-gray-400 flex-shrink-0">
            {currentLessonIdx + 1} / {course.lessons.length}
          </div>
        </div>
      </div>

      <div className="flex max-w-5xl mx-auto">
        {/* Sidebar */}
        <div className="w-56 flex-shrink-0 hidden lg:block">
          <div className="sticky top-16 pt-6 px-4">
            <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3 px-2">LESSONS</div>
            {course.lessons.map((lesson, idx) => {
              const done = completedLessons.includes(lesson.id);
              const active = idx === currentLessonIdx && !finished;
              return (
                <button
                  key={lesson.id}
                  onClick={() => { setCurrentLessonIdx(idx); setFinished(false); }}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-xs mb-1 transition-all flex items-start gap-2 ${
                    active ? "bg-violet-100 text-violet-700 font-semibold" : "text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full flex-shrink-0 mt-0.5 flex items-center justify-center ${done ? "bg-emerald-500" : active ? "bg-violet-500" : "bg-gray-200"}`}>
                    {done ? <CheckCircle2 className="w-3 h-3 text-white" /> : <span className="text-[9px] font-bold text-white">{idx + 1}</span>}
                  </div>
                  <span className="line-clamp-2">{lesson.title}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 px-6 py-8 max-w-2xl">
          {finished ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mb-6 shadow-lg shadow-violet-200">
                <Trophy className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-black text-gray-900 mb-2">Course Complete! 🎉</h2>
              <p className="text-gray-500 text-base mb-2">You've completed <strong>{course.title}</strong></p>
              <p className="text-gray-400 text-sm mb-8">
                {completedLessons.length} lessons · {Object.keys(quizScores).length} quizzes answered
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => { setCurrentLessonIdx(0); setFinished(false); setCompletedLessons([]); }}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Review Again
                </button>
                <button
                  onClick={() => window.close()}
                  className="px-5 py-2.5 rounded-xl bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          ) : currentLesson ? (
            <>
              {/* Lesson header */}
              <div className="mb-6">
                <div className="text-xs font-bold uppercase tracking-widest text-violet-500 mb-1">
                  Lesson {currentLessonIdx + 1}
                </div>
                <h1 className="text-2xl font-black text-gray-900 mb-2">{currentLesson.title}</h1>
                {currentLesson.objectives && (
                  <p className="text-sm text-gray-500 leading-relaxed">{currentLesson.objectives}</p>
                )}
              </div>

              {/* Blocks */}
              <div className="space-y-5">
                {currentLesson.blocks.map((block) => (
                  <div key={block.id}>
                    {block.blockType === "text" && <TextBlock content={block.content as any} />}
                    {block.blockType === "key_concept" && <KeyConceptBlock content={block.content as any} />}
                    {block.blockType === "quiz" && (
                      <QuizBlock
                        content={block.content as any}
                        onAnswer={(correct) => handleQuizAnswer(block.id, correct)}
                      />
                    )}
                    {block.blockType === "summary" && <SummaryBlock content={block.content as any} />}
                    {block.blockType === "callout" && <CalloutBlock content={block.content as any} />}
                  </div>
                ))}
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between mt-10 pt-6 border-t border-gray-100">
                <button
                  onClick={handlePrev}
                  disabled={currentLessonIdx === 0}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" /> Previous
                </button>
                <button
                  onClick={handleNext}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold transition-colors"
                >
                  {currentLessonIdx >= course.lessons.length - 1 ? "Finish Course" : "Next Lesson"}
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
