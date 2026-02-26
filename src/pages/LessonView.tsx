import { Layout } from "@/components/layout/Layout";
import { useCourse, useCourseLessons, useLessonExercises, useCompleteLesson, useSubmitExercise } from "@/hooks/useAcademy";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ExternalLink, CheckCircle2, Send, Dumbbell } from "lucide-react";
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
  const submitExercise = useSubmitExercise();
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
        <Link to={`/course/${courseId}`} className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to {course?.title || "course"}
        </Link>

        {lesson ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="mb-4 font-display text-3xl font-bold text-foreground">{lesson.title}</h1>

            {/* Content link */}
            <div className="mb-6 rounded-xl border border-border bg-card p-6">
              <h3 className="mb-2 text-sm font-medium text-muted-foreground">Lesson Content</h3>
              <a href={lesson.content_uri} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary hover:underline">
                <ExternalLink className="h-4 w-4" /> Open lesson content
              </a>
            </div>

            {/* Quiz link */}
            <div className="mb-6 rounded-xl border border-border bg-card p-6">
              <h3 className="mb-2 text-sm font-medium text-muted-foreground">Quiz</h3>
              <a href={lesson.quiz_uri} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary hover:underline">
                <ExternalLink className="h-4 w-4" /> Take the quiz
              </a>
            </div>

            {/* Exercises with submit */}
            {exercises && exercises.length > 0 && (
              <div className="mb-6">
                <h3 className="mb-3 font-display text-lg font-semibold text-foreground flex items-center gap-2">
                  <Dumbbell className="h-5 w-5" /> Exercises
                </h3>
                <div className="space-y-3">
                  {exercises.map((ex: any) => (
                    <ExerciseItem
                      key={ex.id}
                      exercise={ex}
                      courseId={courseId!}
                      lessonId={lessonId!}
                      submitExercise={submitExercise}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Complete button */}
            {account && (
              <button onClick={handleComplete} disabled={completing} className="btn-primary-gradient flex w-full items-center justify-center gap-2 rounded-xl py-3 font-display font-semibold disabled:opacity-50">
                <CheckCircle2 className="h-5 w-5" />
                {completing ? "Completing..." : "Mark Lesson Complete"}
              </button>
            )}
          </motion.div>
        ) : (
          <div className="py-16 text-center text-muted-foreground">Lesson not found</div>
        )}
      </div>
    </Layout>
  );
}

function ExerciseItem({
  exercise,
  courseId,
  lessonId,
  submitExercise,
}: {
  exercise: any;
  courseId: string;
  lessonId: string;
  submitExercise: (courseId: string, lessonId: string, exerciseId: string, score: number, hintsUsed: number) => Promise<any>;
}) {
  const [score, setScore] = useState("");
  const [hintsUsed, setHintsUsed] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleSubmit = async () => {
    const s = Number(score);
    if (isNaN(s) || s < 0 || s > Number(exercise.max_score)) {
      toast.error(`Score must be between 0 and ${exercise.max_score}`);
      return;
    }
    setSubmitting(true);
    try {
      await submitExercise(courseId, lessonId, exercise.id, s, hintsUsed);
      toast.success("Exercise submitted!");
      setScore("");
      setHintsUsed(0);
      setExpanded(false);
    } catch (e: any) {
      toast.error(e.message || "Failed to submit");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium text-card-foreground">{exercise.title}</p>
          <p className="text-xs text-muted-foreground">
            Max: {exercise.max_score} · Mastery: {exercise.mastery_threshold}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <a href={exercise.exercise_uri} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-primary hover:underline">
            Practice <ExternalLink className="h-3.5 w-3.5" />
          </a>
          <button onClick={() => setExpanded(!expanded)} className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors">
            {expanded ? "Cancel" : "Submit Score"}
          </button>
        </div>
      </div>

      {expanded && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-4 border-t border-border pt-4">
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Score</label>
              <input
                type="number"
                value={score}
                onChange={(e) => setScore(e.target.value)}
                placeholder={`0-${exercise.max_score}`}
                min={0}
                max={exercise.max_score}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="w-24">
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Hints Used</label>
              <input
                type="number"
                value={hintsUsed}
                onChange={(e) => setHintsUsed(Number(e.target.value))}
                min={0}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <button onClick={handleSubmit} disabled={submitting} className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
              <Send className="h-3.5 w-3.5" /> {submitting ? "..." : "Submit"}
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
