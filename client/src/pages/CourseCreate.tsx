import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import {
  ArrowLeft,
  CheckCircle2,
  FileText,
  Loader2,
  Sparkles,
  Upload,
  X,
} from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { Link, useLocation } from "wouter";

type Step = "upload" | "processing" | "done";

export default function CourseCreate() {
  const [, navigate] = useLocation();
  const [step, setStep] = useState<Step>("upload");
  const [title, setTitle] = useState("");
  const [rawText, setRawText] = useState("");
  const [sourceType, setSourceType] = useState<"pdf" | "docx" | "pptx" | "text">("text");
  const [sourceFileName, setSourceFileName] = useState<string | undefined>();
  const [dragging, setDragging] = useState(false);
  const [processingMsg, setProcessingMsg] = useState("Analysing document...");
  const fileRef = useRef<HTMLInputElement>(null);

  const createMutation = trpc.courses.createFromText.useMutation({
    onSuccess: ({ courseId }) => {
      setStep("done");
      setTimeout(() => navigate(`/courses/${courseId}/edit`), 1800);
    },
    onError: (e) => {
      toast.error(e.message ?? "Failed to generate course");
      setStep("upload");
    },
  });

  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string ?? "");
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };

  const handleFile = useCallback(async (file: File) => {
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    const typeMap: Record<string, "pdf" | "docx" | "pptx" | "text"> = {
      pdf: "pdf", docx: "docx", doc: "docx", pptx: "pptx", ppt: "pptx",
      txt: "text", md: "text",
    };
    const detectedType = typeMap[ext] ?? "text";
    setSourceType(detectedType);
    setSourceFileName(file.name);
    if (!title) setTitle(file.name.replace(/\.[^/.]+$/, ""));

    // For text-based files read directly; for binary files send as base64
    if (["txt", "md"].includes(ext)) {
      const text = await readFileAsText(file);
      setRawText(text);
    } else {
      // Read as base64 and send to server for extraction
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = (e.target?.result as string).split(",")[1] ?? "";
        setRawText(`__BASE64__:${detectedType}:${base64}`);
      };
      reader.readAsDataURL(file);
    }
  }, [title]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleSubmit = async () => {
    if (!title.trim()) { toast.error("Please enter a course title"); return; }
    if (!rawText.trim()) { toast.error("Please upload a document or enter text"); return; }

    setStep("processing");
    const msgs = [
      "Analysing document structure...",
      "Extracting key concepts...",
      "Generating lesson outline...",
      "Building content blocks...",
      "Adding quizzes and knowledge checks...",
      "Finalising your course...",
    ];
    let i = 0;
    const interval = setInterval(() => {
      i = (i + 1) % msgs.length;
      setProcessingMsg(msgs[i]);
    }, 2500);

    try {
      await createMutation.mutateAsync({ title, rawText, sourceType, sourceFileName });
    } finally {
      clearInterval(interval);
    }
  };

  return (
    <AppLayout>
      <div className="p-8 max-w-2xl mx-auto">
        {/* Back */}
        <Link href="/courses">
          <button className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Courses
          </button>
        </Link>

        {/* Processing overlay */}
        {step === "processing" && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="relative mb-8">
              <div className="w-20 h-20 rounded-full bg-violet-100 flex items-center justify-center">
                <Sparkles className="w-10 h-10 text-violet-500 animate-pulse" />
              </div>
              <div className="absolute -inset-2 rounded-full border-2 border-violet-200 animate-ping opacity-30" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">AI is building your course</h2>
            <p className="text-gray-500 text-sm mb-4">{processingMsg}</p>
            <div className="flex gap-1.5">
              {[0, 1, 2].map((i) => (
                <div key={i} className="w-2 h-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
          </div>
        )}

        {/* Done */}
        {step === "done" && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Course created!</h2>
            <p className="text-gray-500 text-sm">Opening the editor...</p>
          </div>
        )}

        {/* Upload form */}
        {step === "upload" && (
          <>
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Create a Course</h1>
              <p className="text-gray-500 text-sm">
                Upload any document and AI will convert it into a structured eLearning course with lessons, quizzes, and key concepts.
              </p>
            </div>

            {/* Title */}
            <div className="mb-5">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Course Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Introduction to Sales Fundamentals"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent transition-all"
              />
            </div>

            {/* File drop zone */}
            <div className="mb-5">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Source Document</label>
              <div
                className={`relative border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer ${
                  dragging
                    ? "border-violet-400 bg-violet-50"
                    : rawText
                    ? "border-green-300 bg-green-50"
                    : "border-gray-200 hover:border-violet-300 hover:bg-violet-50/50"
                }`}
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
                onClick={() => fileRef.current?.click()}
              >
                <input
                  ref={fileRef}
                  type="file"
                  accept=".pdf,.docx,.doc,.pptx,.ppt,.txt,.md"
                  className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
                />
                {rawText && sourceFileName ? (
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center mb-3">
                      <FileText className="w-6 h-6 text-green-600" />
                    </div>
                    <p className="font-semibold text-green-700 text-sm">{sourceFileName}</p>
                    <p className="text-green-600 text-xs mt-1">File ready — click to replace</p>
                    <button
                      className="mt-3 text-xs text-gray-400 hover:text-red-500 flex items-center gap-1"
                      onClick={(e) => { e.stopPropagation(); setRawText(""); setSourceFileName(undefined); }}
                    >
                      <X className="w-3 h-3" /> Remove
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center mb-3">
                      <Upload className="w-6 h-6 text-violet-500" />
                    </div>
                    <p className="font-semibold text-gray-700 text-sm mb-1">
                      Drop your document here
                    </p>
                    <p className="text-gray-400 text-xs">
                      PDF, Word (.docx), PowerPoint (.pptx), or plain text
                    </p>
                    <p className="text-violet-500 text-xs mt-2 font-medium">or click to browse</p>
                  </div>
                )}
              </div>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 h-px bg-gray-100" />
              <span className="text-xs text-gray-400 font-medium">OR</span>
              <div className="flex-1 h-px bg-gray-100" />
            </div>

            {/* Paste text */}
            <div className="mb-8">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Paste Text Content</label>
              <textarea
                value={rawText.startsWith("__BASE64__") ? "" : rawText}
                onChange={(e) => { setRawText(e.target.value); setSourceType("text"); setSourceFileName(undefined); }}
                placeholder="Paste your training content, notes, or any text here..."
                rows={6}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent transition-all resize-none"
              />
            </div>

            {/* Submit */}
            <Button
              className="w-full bg-violet-600 hover:bg-violet-700 text-white py-3 text-sm font-semibold gap-2 rounded-xl"
              onClick={handleSubmit}
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              Generate Course with AI
            </Button>

            <p className="text-center text-xs text-gray-400 mt-3">
              AI will create lessons, quizzes, key concepts, and summaries automatically
            </p>
          </>
        )}
      </div>
    </AppLayout>
  );
}
