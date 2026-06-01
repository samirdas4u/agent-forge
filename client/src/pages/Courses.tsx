import AppLayout from "@/components/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import {
  BookOpen,
  Clock,
  FileText,
  Globe,
  Lock,
  Plus,
  Sparkles,
  Trash2,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";

const SOURCE_ICONS: Record<string, string> = {
  pdf: "📄",
  docx: "📝",
  pptx: "📊",
  text: "✏️",
  url: "🔗",
};

export default function Courses() {
  const [, navigate] = useLocation();
  const { data: courses, isLoading, refetch } = trpc.courses.list.useQuery();
  const deleteMutation = trpc.courses.delete.useMutation({
    onSuccess: () => { toast.success("Course deleted"); refetch(); },
    onError: () => toast.error("Failed to delete course"),
  });
  const publishMutation = trpc.courses.update.useMutation({
    onSuccess: () => { toast.success("Course published! Shareable link is now active."); refetch(); },
    onError: () => toast.error("Failed to publish course"),
  });

  return (
    <AppLayout>
      <div className="p-8 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Courses</h1>
            <p className="text-gray-500 mt-1 text-sm">
              Upload any document and AI will convert it into an interactive eLearning course.
            </p>
          </div>
          <Link href="/courses/new">
            <Button className="bg-violet-600 hover:bg-violet-700 text-white gap-2">
              <Plus className="w-4 h-4" />
              Create Course
            </Button>
          </Link>
        </div>

        {/* Empty state */}
        {!isLoading && (!courses || courses.length === 0) && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 rounded-2xl bg-violet-50 flex items-center justify-center mb-6">
              <BookOpen className="w-10 h-10 text-violet-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No courses yet</h3>
            <p className="text-gray-500 max-w-sm mb-6 text-sm leading-relaxed">
              Upload a PDF, Word doc, PowerPoint, or paste text — AI will structure it into a complete eLearning course in seconds.
            </p>
            <Link href="/courses/new">
              <Button className="bg-violet-600 hover:bg-violet-700 text-white gap-2">
                <Sparkles className="w-4 h-4" />
                Create your first course
              </Button>
            </Link>
          </div>
        )}

        {/* Loading skeleton */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse">
                <div className="h-4 bg-gray-100 rounded w-3/4 mb-3" />
                <div className="h-3 bg-gray-100 rounded w-full mb-2" />
                <div className="h-3 bg-gray-100 rounded w-2/3 mb-6" />
                <div className="h-8 bg-gray-100 rounded w-1/3" />
              </div>
            ))}
          </div>
        )}

        {/* Course grid */}
        {!isLoading && courses && courses.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {courses.map((course) => (
              <div
                key={course.id}
                className="group bg-white rounded-2xl border border-gray-100 hover:border-violet-200 hover:shadow-lg transition-all duration-200 overflow-hidden flex flex-col"
              >
                {/* Top accent */}
                <div className={`h-1 w-full ${course.status === "published" ? "bg-gradient-to-r from-violet-500 to-purple-500" : "bg-gray-200"}`} />

                <div className="p-6 flex flex-col flex-1">
                  {/* Header row */}
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-2xl">{SOURCE_ICONS[course.sourceType] ?? "📄"}</span>
                    <Badge
                      variant="outline"
                      className={
                        course.status === "published"
                          ? "border-green-200 text-green-700 bg-green-50 text-xs"
                          : "border-gray-200 text-gray-500 bg-gray-50 text-xs"
                      }
                    >
                      {course.status === "published" ? (
                        <Globe className="w-3 h-3 mr-1" />
                      ) : (
                        <Lock className="w-3 h-3 mr-1" />
                      )}
                      {course.status}
                    </Badge>
                  </div>

                  <h3 className="font-bold text-gray-900 text-base mb-2 line-clamp-2 leading-snug">
                    {course.title}
                  </h3>

                  {course.description && (
                    <p className="text-gray-500 text-sm line-clamp-2 mb-4 leading-relaxed flex-1">
                      {course.description}
                    </p>
                  )}

                  {/* Meta */}
                  <div className="flex items-center gap-4 text-xs text-gray-400 mb-5">
                    {course.estimatedMinutes && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {course.estimatedMinutes} min
                      </span>
                    )}
                    {course.sourceFileName && (
                      <span className="flex items-center gap-1 truncate max-w-[120px]">
                        <FileText className="w-3 h-3 flex-shrink-0" />
                        {course.sourceFileName}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-auto">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 text-xs border-gray-200 hover:border-violet-300 hover:text-violet-700"
                      onClick={() => navigate(`/courses/${course.id}/edit`)}
                    >
                      Edit
                    </Button>
                    {course.status === "draft" ? (
                      <Button
                        size="sm"
                        className="flex-1 text-xs bg-violet-600 hover:bg-violet-700 text-white"
                        onClick={() => publishMutation.mutate({ id: course.id, status: "published" })}
                        disabled={publishMutation.isPending}
                      >
                        <Globe className="w-3 h-3 mr-1" />
                        Publish
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 text-xs border-green-200 text-green-700 hover:bg-green-50"
                        onClick={() => {
                          navigator.clipboard.writeText(`${window.location.origin}/learn/${course.slug}`);
                          toast.success("Learner URL copied to clipboard!");
                        }}
                      >
                        <Globe className="w-3 h-3 mr-1" />
                        Copy URL
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-gray-400 hover:text-red-500 hover:bg-red-50 px-2"
                      onClick={() => {
                        if (confirm("Delete this course?")) deleteMutation.mutate({ id: course.id });
                      }}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
