import { Layout } from "@/components/layout/Layout";
import { useCourse, useCourseLessons, useLessonExercises, useCompleteLesson } from "@/hooks/useAcademy";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ExternalLink, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useCurrentAccount } from "@mysten/dapp-kit";

export default function LessonViewPage() {
  const { courseId, lessonId } = useParams();
  const account = useCurrentAccount();
  const { data: course } = useCourse(courseId);
  const { data: lessons } = useCourseLessons(courseId);
  const { data: exercises } = useLessonExercises(lessonId);
  const completeLesson = useCompleteLesson();
  const [completing, setCompleting] = useState(false);

  const lesson = lessons?.find((l: any) => l.id === lessonId);

  const handleComplete = async () => {
    if (!courseId || !lessonId) return;
    setCompleting(true);
    try {
      await completeLesson(courseId, lessonId, 100);
      toast.success("Lesson completed!");
    } catch (e: any) {
      toast.error(e.message || "Failed to complete");
    } finally {
      setCompleting(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto max-w-3xl px-4 py-10">
        <Link
          to={`/course/${courseId}`}
          className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to {course?.title || "course"}
        </Link>

        {lesson ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="mb-4 font-display text-3xl font-bold text-foreground">
              {lesson.title}
            </h1>

            {/* Content link */}
            <div className="mb-6 rounded-xl border border-border bg-card p-6">
              <h3 className="mb-2 text-sm font-medium text-muted-foreground">Lesson Content</h3>
              <a
                href={lesson.content_uri}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-primary hover:underline"
              >
                <ExternalLink className="h-4 w-4" />
                Open lesson content
              </a>
            </div>

            {/* Quiz link */}
            <div className="mb-6 rounded-xl border border-border bg-card p-6">
              <h3 className="mb-2 text-sm font-medium text-muted-foreground">Quiz</h3>
              <a
                href={lesson.quiz_uri}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-primary hover:underline"
              >
                <ExternalLink className="h-4 w-4" />
                Take the quiz
              </a>
            </div>

            {/* Exercises */}
            {exercises && exercises.length > 0 && (
              <div className="mb-6">
                <h3 className="mb-3 font-display text-lg font-semibold text-foreground">
                  Exercises
                </h3>
                <div className="space-y-3">
                  {exercises.map((ex: any) => (
                    <div
                      key={ex.id}
                      className="flex items-center justify-between rounded-xl border border-border bg-card p-4"
                    >
                      <div>
                        <p className="font-medium text-card-foreground">{ex.title}</p>
                        <p className="text-xs text-muted-foreground">
                          Max score: {ex.max_score} · Mastery: {ex.mastery_threshold}
                        </p>
                      </div>
                      <a
                        href={ex.exercise_uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-sm text-primary hover:underline"
                      >
                        Practice <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Complete button */}
            {account && (
              <button
                onClick={handleComplete}
                disabled={completing}
                className="btn-primary-gradient flex w-full items-center justify-center gap-2 rounded-xl py-3 font-display font-semibold disabled:opacity-50"
              >
                <CheckCircle2 className="h-5 w-5" />
                {completing ? "Completing..." : "Mark Lesson Complete"}
              </button>
            )}
          </motion.div>
        ) : (
          <div className="py-16 text-center text-muted-foreground">
            Lesson not found
          </div>
        )}
      </div>
    </Layout>
  );
}
