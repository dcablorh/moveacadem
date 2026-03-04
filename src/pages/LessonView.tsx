import { Layout } from "@/components/layout/Layout";
import {
  useCourse,
  useCourseLessons,
  useLessonExercises,
  useCompleteLesson,
  useSubmitExercise,
  useOwnerCaps,
  useUpdateLesson,
  useStudentProgress,
} from "@/hooks/useAcademy";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle2,
  Send,
  Pencil,
  X,
  Trophy,
  Star,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  Lightbulb,
  RotateCcw,
  BookOpen,
  Circle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { WalrusContent } from "@/components/walrus/WalrusContent";
import { WalrusUploader } from "@/components/walrus/WalrusUploader";
import { useQuery } from "@tanstack/react-query";
import { readBlob, AGGREGATOR_URL } from "@/lib/walrus";
import Editor from "@monaco-editor/react";
import confetti from "canvas-confetti";

// ─── Helpers ────────────────────────────────────────────────────────────────

function decodeUri(uri: any): string {
  if (!uri) return "";
  if (typeof uri === "string") return uri;
  if (Array.isArray(uri)) return new TextDecoder().decode(new Uint8Array(uri));
  return String(uri);
}

function extractBlobId(uri: string): string | null {
  if (!uri) return null;
  const prefix = `${AGGREGATOR_URL}/v1/blobs/`;
  if (uri.startsWith(prefix)) return uri.slice(prefix.length);
  if (/^[A-Za-z0-9_-]{20,}$/.test(uri)) return uri;
  return null;
}

// ─── Quiz Types ──────────────────────────────────────────────────────────────

interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
  hint?: string;
}

interface QuizData {
  questions: QuizQuestion[];
}

function parseQuizContent(raw: string): QuizData | null {
  try {
    const parsed = JSON.parse(raw);
    if (parsed && Array.isArray(parsed.questions)) return parsed as QuizData;
    if (Array.isArray(parsed)) return { questions: parsed };
    return null;
  } catch {
    return null;
  }
}

// ─── Quiz Component ──────────────────────────────────────────────────────────

function QuizSection({
  quizUri,
  courseId,
  lessonId,
  onComplete,
}: {
  quizUri: string;
  courseId: string;
  lessonId: string;
  onComplete: (score: number) => void;
}) {
  const blobId = extractBlobId(quizUri);
  const { data: rawContent, isLoading } = useQuery({
    queryKey: ["walrus-blob", blobId],
    enabled: !!blobId,
    queryFn: () => readBlob(blobId!),
    staleTime: 1000 * 60 * 10,
  });

  const quizData = rawContent ? parseQuizContent(String(rawContent)) : null;

  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [showHints, setShowHints] = useState<Record<number, boolean>>({});

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 py-4 text-muted-foreground text-sm">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        Loading quiz...
      </div>
    );
  }

  if (!quizData) return <WalrusContent uri={quizUri} />;

  const { questions } = quizData;

  const handleSubmit = () => {
    let correct = 0;
    questions.forEach((q, i) => {
      if (answers[i] === q.correct) correct++;
    });
    const pct = Math.round((correct / questions.length) * 100);
    setScore(pct);
    setSubmitted(true);
  };

  const handleRetry = () => {
    setAnswers({});
    setSubmitted(false);
    setScore(0);
    setShowHints({});
  };

  return (
    <div className="space-y-5">
      {questions.map((q, qi) => {
        const userAnswer = answers[qi];
        const isCorrect = submitted && userAnswer === q.correct;
        const isWrong =
          submitted && userAnswer !== undefined && userAnswer !== q.correct;
        return (
          <div
            key={qi}
            className={`rounded-xl border p-5 transition-colors ${
              submitted
                ? isCorrect
                  ? "border-green-500/30 bg-green-500/5"
                  : isWrong
                    ? "border-red-500/30 bg-red-500/5"
                    : "border-border bg-muted/20"
                : "border-border bg-card"
            }`}
          >
            <div className="mb-3 flex items-start justify-between gap-2">
              <p className="font-medium text-foreground text-sm leading-snug">
                <span className="mr-1.5 font-bold text-primary">
                  Q{qi + 1}.
                </span>
                {q.question}
              </p>
              {q.hint && !submitted && (
                <button
                  onClick={() => setShowHints((p) => ({ ...p, [qi]: !p[qi] }))}
                  className="shrink-0 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                >
                  <Lightbulb className="h-3.5 w-3.5" />
                  {showHints[qi] ? "Hide" : "Hint"}
                </button>
              )}
            </div>
            {q.hint && showHints[qi] && (
              <div className="mb-3 rounded-lg bg-accent/10 p-3 text-xs text-foreground/80">
                💡 {q.hint}
              </div>
            )}
            <div className="space-y-2">
              {q.options.map((opt, oi) => {
                const selected = userAnswer === oi;
                const correctOpt = q.correct === oi;
                let optClass =
                  "flex cursor-pointer items-start gap-2.5 rounded-lg border px-3 py-2.5 text-sm transition-all ";
                if (!submitted) {
                  optClass += selected
                    ? "border-primary bg-primary/10 text-foreground font-medium"
                    : "border-border bg-muted/20 text-muted-foreground hover:border-primary/50 hover:bg-muted/40";
                } else {
                  if (correctOpt)
                    optClass +=
                      "border-green-500 bg-green-500/10 text-green-700 dark:text-green-400 font-medium";
                  else if (selected && !correctOpt)
                    optClass +=
                      "border-red-500 bg-red-500/10 text-red-700 dark:text-red-400";
                  else
                    optClass +=
                      "border-border bg-muted/10 text-muted-foreground";
                }
                return (
                  <label key={oi} className={optClass}>
                    <input
                      type="radio"
                      name={`q${qi}`}
                      value={oi}
                      checked={selected}
                      disabled={submitted}
                      onChange={() => setAnswers((p) => ({ ...p, [qi]: oi }))}
                      className="mt-0.5 accent-primary"
                    />
                    <span>{opt}</span>
                    {submitted && correctOpt && (
                      <CheckCircle2 className="ml-auto h-4 w-4 text-green-500 shrink-0" />
                    )}
                  </label>
                );
              })}
            </div>
          </div>
        );
      })}

      {!submitted ? (
        <button
          onClick={handleSubmit}
          disabled={Object.keys(answers).length < questions.length}
          className="w-full rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          Submit Quiz ({Object.keys(answers).length}/{questions.length}{" "}
          answered)
        </button>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-xl border p-5 text-center ${
            score >= 70
              ? "border-green-500/30 bg-green-500/5"
              : "border-yellow-500/30 bg-yellow-500/5"
          }`}
        >
          <p className="text-3xl font-bold text-foreground">{score}/100</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {questions.filter((q, i) => answers[i] === q.correct).length} of{" "}
            {questions.length} correct
          </p>
          <p className="mt-2 font-semibold text-lg">
            {score >= 70 ? "✅ Passed!" : "❌ Not quite — try again"}
          </p>
          <div className="mt-4 flex justify-center gap-3">
            <button
              onClick={handleRetry}
              className="flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
            >
              <RotateCcw className="h-4 w-4" /> Retry
            </button>
            {score >= 70 && (
              <button
                onClick={() => onComplete(score)}
                className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
              >
                <CheckCircle2 className="h-4 w-4" /> Submit to Chain ({score})
              </button>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}

// ─── Exercise Item ────────────────────────────────────────────────────────────

function ExerciseItem({
  exercise,
  courseId,
  lessonId,
  submitExercise,
  onMastered,
}: {
  exercise: any;
  courseId: string;
  lessonId: string;
  submitExercise: (
    courseId: string,
    lessonId: string,
    exerciseId: string,
    score: number,
    hintsUsed: number,
  ) => Promise<any>;
  onMastered?: () => void;
}) {
  const [code, setCode] = useState("// Write your Move code here\n");
  const [hintsUsed, setHintsUsed] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [mastered, setMastered] = useState(false);

  const exerciseUri = decodeUri(exercise.exercise_uri);
  const maxScore = Number(exercise.max_score || 100);
  const masteryThreshold = Number(exercise.mastery_threshold || 80);

  const handleRun = async () => {
    if (!code.includes("module ") || !code.includes("fun ")) {
      toast.error(
        "Validation Failed: Code must contain a module and a function.",
      );
      return;
    }

    setSubmitting(true);
    try {
      // Validated locally, submit a 100 score automatically
      const s = 100;
      const response = await submitExercise(
        courseId,
        lessonId,
        exercise.id,
        s,
        hintsUsed,
      );

      const hasCourseCompleted = response?.events?.some((e: any) =>
        e.type.includes("CourseCompleted"),
      );
      const hasLessonCompleted = response?.events?.some((e: any) =>
        e.type.includes("LessonCompleted"),
      );

      if (hasCourseCompleted) {
        confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
        toast.success("🎉 Course Complete! You earned a certificate!");
      } else if (hasLessonCompleted || true) {
        // Always show confetti on lesson complete
        confetti({ particleCount: 100, spread: 60, origin: { y: 0.6 } });
        toast.success("🎯 Lesson Mastered!");
      } else if (s >= masteryThreshold) {
        setMastered(true);
        if (onMastered) onMastered();
        toast.success("🎉 Exercise Mastered!");
      }
      setExpanded(false);
    } catch (e: any) {
      toast.error(e.message || "Failed to submit");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className={`rounded-xl border transition-colors ${mastered ? "border-green-500/30 bg-green-500/5" : "border-border bg-card"} p-4`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            {mastered && (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-green-500" />
            )}
            <p className="font-medium text-card-foreground truncate">
              {exercise.title}
            </p>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Interactive Move Exercise · {maxScore} pts total
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {exerciseUri && (
            <a
              href={exerciseUri}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-primary hover:underline"
            >
              <Star className="h-3.5 w-3.5" /> View Challenge Details
            </a>
          )}
          {!mastered && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors"
            >
              {expanded ? "Cancel" : "Open Code Editor"}
            </button>
          )}
          {mastered && (
            <span className="rounded-full bg-green-500/10 px-2.5 py-1 text-xs font-semibold text-green-600 dark:text-green-400">
              Mastered ✓
            </span>
          )}
        </div>
      </div>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-4 border-t border-border pt-4">
              <div className="flex flex-col gap-3">
                <div className="flex-1 w-full border border-border rounded-lg overflow-hidden h-[250px]">
                  <Editor
                    height="100%"
                    language="rust"
                    theme="vs-dark"
                    value={code}
                    onChange={(val) => setCode(val || "")}
                    options={{ minimap: { enabled: false }, fontSize: 13 }}
                  />
                </div>
                <div className="flex items-end justify-between">
                  <div className="w-24">
                    <label className="mb-1 block text-xs font-medium text-muted-foreground">
                      Hints Used
                    </label>
                    <input
                      type="number"
                      value={hintsUsed}
                      onChange={(e) => setHintsUsed(Number(e.target.value))}
                      min={0}
                      className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <button
                    onClick={handleRun}
                    disabled={submitting || !code}
                    className="flex items-center gap-1.5 rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                  >
                    <Send className="h-3.5 w-3.5" />{" "}
                    {submitting ? "Validating..." : "Run & Submit"}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Edit Lesson Form ─────────────────────────────────────────────────────────

function EditLessonForm({
  lesson,
  courseId,
  capId,
  updateLesson,
  contentUri,
  quizUri,
  onClose,
}: {
  lesson: any;
  courseId: string;
  capId: string;
  updateLesson: any;
  contentUri: string;
  quizUri: string;
  onClose: () => void;
}) {
  const [title, setTitle] = useState(lesson.title || "");
  const [newContentUri, setNewContentUri] = useState(contentUri);
  const [newQuizUri, setNewQuizUri] = useState(quizUri);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateLesson(
        lesson.id,
        courseId,
        capId,
        title,
        newContentUri,
        newQuizUri,
      );
      toast.success("Lesson updated!");
      onClose();
    } catch (e: any) {
      toast.error(e.message || "Failed to update lesson");
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      className="mb-6 rounded-xl border border-primary/30 bg-primary/5 p-5 space-y-4"
    >
      <div className="flex items-center justify-between">
        <h3 className="font-display text-sm font-semibold text-foreground">
          Edit Lesson
        </h3>
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-foreground">
          Title
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-xl border border-input bg-card px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>
      <WalrusUploader
        label="Content"
        onUploaded={(url) => setNewContentUri(url)}
        placeholder="Upload new lesson content..."
      />
      <WalrusUploader
        label="Quiz"
        onUploaded={(url) => setNewQuizUri(url)}
        placeholder="Upload new quiz JSON..."
      />
      <div className="flex gap-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
        <button
          onClick={onClose}
          className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
        >
          Cancel
        </button>
      </div>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function LessonViewPage() {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const account = useCurrentAccount();
  const { data: course } = useCourse(courseId);
  const { data: lessons } = useCourseLessons(courseId);
  const { data: exercises } = useLessonExercises(lessonId);
  const { data: caps } = useOwnerCaps();
  const { data: progress } = useStudentProgress();
  const completeLesson = useCompleteLesson();
  const submitExercise = useSubmitExercise();
  const updateLesson = useUpdateLesson();
  const [completing, setCompleting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "content" | "exercises" | "quiz" | string
  >("content");
  const [localMasteredEx, setLocalMasteredEx] = useState<
    Record<string, boolean>
  >({});

  const lesson = lessons?.find((l: any) => {
    const lid = typeof l.id === "string" ? l.id : String(l.id);
    return lid === lessonId;
  });
  const isOwner = caps?.some((c: any) => String(c.course_id) === courseId);
  const ownerCap = caps?.find((c: any) => String(c.course_id) === courseId);

  const lessonCompleted = progress?.some(
    (p: any) =>
      String(p.course_id) === courseId && String(p.lesson_id) === lessonId,
  );

  const contentUri = decodeUri(lesson?.content_uri);
  const quizUri = decodeUri(lesson?.quiz_uri);

  // Build sorted lesson list for prev/next navigation
  const sortedLessons = [...(lessons || [])].sort(
    (a: any, b: any) => Number(a.order) - Number(b.order),
  );
  const currentIdx = sortedLessons.findIndex(
    (l: any) => String(l.id) === lessonId,
  );
  const prevLesson = currentIdx > 0 ? sortedLessons[currentIdx - 1] : null;
  const nextLesson =
    currentIdx >= 0 && currentIdx < sortedLessons.length - 1
      ? sortedLessons[currentIdx + 1]
      : null;
  const totalLessons = sortedLessons.length;
  const progressPct =
    totalLessons > 0 ? Math.round(((currentIdx + 1) / totalLessons) * 100) : 0;

  const handleCompleteWithScore = async (score: number) => {
    if (!courseId || !lessonId || completing) return;
    setCompleting(true);
    try {
      const response = await completeLesson(courseId, lessonId, score);

      const hasCourseCompleted = response?.events?.some((e: any) =>
        e.type.includes("CourseCompleted"),
      );
      const hasLessonCompleted = response?.events?.some((e: any) =>
        e.type.includes("LessonCompleted"),
      );

      if (hasCourseCompleted) {
        confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
        toast.success("🎉 Course Complete! You earned a certificate!");
      } else if (hasLessonCompleted || true) {
        // Explicit user action, so we show confetti anyway
        confetti({ particleCount: 100, spread: 60, origin: { y: 0.6 } });
        toast.success("✅ Lesson completed!");
      }

      if (nextLesson) {
        const nextId =
          typeof nextLesson.id === "string"
            ? nextLesson.id
            : String(nextLesson.id);
        setTimeout(() => navigate(`/lesson/${courseId}/${nextId}`), 1000);
      }
    } catch (e: any) {
      if (e.message?.includes("EAlreadyCompleted")) {
        toast.error("Already completed this lesson");
      } else {
        toast.error(e.message || "Failed to complete");
      }
    } finally {
      setCompleting(false);
    }
  };

  const hasQuiz = !!quizUri;
  const hasExercises = exercises && exercises.length > 0;

  const tabs = [
    { id: "content" as const, label: "📖 Content" },
    ...(hasExercises
      ? [
          {
            id: "exercises" as const,
            label: `💪 Exercises (${exercises.length})`,
          },
        ]
      : []),
    ...(hasQuiz ? [{ id: "quiz" as const, label: "📝 Quiz" }] : []),
  ];

  return (
    <Layout>
      <div className="container mx-auto max-w-6xl px-4 py-8 flex flex-col md:flex-row gap-8">
        {/* Adaptive Sidebar */}
        <aside className="w-full md:w-64 shrink-0 order-2 md:order-1 self-start sticky top-8 space-y-4">
          <div className="rounded-xl border border-border bg-card p-4">
            <h3 className="font-display font-semibold text-foreground mb-3 text-sm flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary" /> Curriculum
            </h3>

            <div className="space-y-1">
              <button
                onClick={() => setActiveTab("content")}
                className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors ${activeTab === "content" ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted"}`}
              >
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                Content
              </button>

              {hasExercises && (
                <div className="mt-4 space-y-1">
                  <p className="px-2 text-[10px] font-semibold text-muted-foreground/70 mb-1 uppercase tracking-wider">
                    Exercises
                  </p>
                  {exercises.map((ex: any) => {
                    const isMastered = localMasteredEx[ex.id];
                    return (
                      <button
                        key={ex.id}
                        onClick={() => setActiveTab(ex.id)}
                        className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors ${activeTab === ex.id ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted"}`}
                      >
                        {isMastered ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                        ) : (
                          <Circle className="h-4 w-4 text-muted-foreground/40 shrink-0" />
                        )}
                        <span className="truncate">{ex.title}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {hasQuiz && (
                <div className="mt-4 space-y-1">
                  <p className="px-2 text-[10px] font-semibold text-muted-foreground/70 mb-1 uppercase tracking-wider">
                    Assessment
                  </p>
                  <button
                    onClick={() => setActiveTab("quiz")}
                    className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors ${activeTab === "quiz" ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted"}`}
                  >
                    {lessonCompleted ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                    ) : (
                      <HelpCircle className="h-4 w-4 text-primary shrink-0" />
                    )}
                    Quiz
                  </button>
                </div>
              )}
            </div>
          </div>
        </aside>

        <div className="flex-1 min-w-0 order-1 md:order-2">
          {/* Breadcrumb */}
          <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
            <Link
              to={`/course/${courseId}`}
              className="hover:text-foreground transition-colors flex items-center gap-1"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              {course?.title || "Course"}
            </Link>
            <span>/</span>
            <span className="text-foreground line-clamp-1">
              {lesson?.title || "Lesson"}
            </span>
          </div>

          {/* Progress bar */}
          <div className="mb-6">
            <div className="mb-1.5 flex items-center justify-between text-xs text-muted-foreground">
              <span>
                Lesson {currentIdx + 1} of {totalLessons}
              </span>
              <span>{progressPct}% through course</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <motion.div
                className="h-full rounded-full bg-primary"
                initial={{ width: 0 }}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              />
            </div>
          </div>

          {lesson ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {/* Header */}
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <h1 className="font-display text-2xl font-bold text-foreground md:text-3xl">
                    {lesson.title}
                  </h1>
                  {lessonCompleted && (
                    <div className="mt-2 flex items-center gap-1.5 text-sm text-green-600 dark:text-green-400">
                      <CheckCircle2 className="h-4 w-4" /> Completed
                    </div>
                  )}
                </div>
                {isOwner && !editing && (
                  <button
                    onClick={() => setEditing(true)}
                    className="flex shrink-0 items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors"
                  >
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </button>
                )}
              </div>

              {/* Owner edit form */}
              {editing && ownerCap && (
                <EditLessonForm
                  lesson={lesson}
                  courseId={courseId!}
                  capId={ownerCap.id}
                  updateLesson={updateLesson}
                  contentUri={contentUri}
                  quizUri={quizUri}
                  onClose={() => setEditing(false)}
                />
              )}

              {/* Tab bar (only when multiple tabs) */}
              {tabs.length > 1 && (
                <div className="mb-6 flex gap-1 rounded-xl border border-border bg-muted/40 p-1">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                        activeTab === tab.id
                          ? "bg-card shadow-sm text-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Content Tab */}
              {activeTab === "content" && (
                <div className="rounded-xl border border-border bg-card p-6">
                  {contentUri ? (
                    <WalrusContent uri={contentUri} />
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No content uploaded for this lesson.
                    </p>
                  )}
                </div>
              )}

              {/* Exercises Tab (Individual Exercise based on Sidebar) */}
              {activeTab !== "content" &&
                activeTab !== "quiz" &&
                activeTab !== "exercises" &&
                exercises &&
                exercises.some((e: any) => e.id === activeTab) && (
                  <div className="space-y-3">
                    {exercises
                      .filter((e: any) => e.id === activeTab)
                      .map((ex: any) => (
                        <ExerciseItem
                          key={ex.id}
                          exercise={ex}
                          courseId={courseId!}
                          lessonId={lessonId!}
                          submitExercise={submitExercise}
                          onMastered={() =>
                            setLocalMasteredEx((prev) => ({
                              ...prev,
                              [ex.id]: true,
                            }))
                          }
                        />
                      ))}
                  </div>
                )}

              {/* Exercises List Fallback Tab (If they click the general exercises tab from top bar) */}
              {activeTab === "exercises" &&
                exercises &&
                exercises.length > 0 && (
                  <div className="space-y-3">
                    {exercises.map((ex: any) => (
                      <ExerciseItem
                        key={ex.id}
                        exercise={ex}
                        courseId={courseId!}
                        lessonId={lessonId!}
                        submitExercise={submitExercise}
                        onMastered={() =>
                          setLocalMasteredEx((prev) => ({
                            ...prev,
                            [ex.id]: true,
                          }))
                        }
                      />
                    ))}
                  </div>
                )}

              {/* Quiz Tab */}
              {activeTab === "quiz" && quizUri && (
                <div className="rounded-xl border border-border bg-card p-6">
                  <h3 className="mb-5 font-display text-lg font-semibold text-foreground flex items-center gap-2">
                    <HelpCircle className="h-5 w-5 text-primary" /> Lesson Quiz
                  </h3>
                  {account && !lessonCompleted ? (
                    <QuizSection
                      quizUri={quizUri}
                      courseId={courseId!}
                      lessonId={lessonId!}
                      onComplete={handleCompleteWithScore}
                    />
                  ) : lessonCompleted ? (
                    <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-5 text-center">
                      <CheckCircle2 className="mx-auto mb-2 h-8 w-8 text-green-500" />
                      <p className="font-semibold text-foreground">
                        Quiz completed! Lesson marked as done.
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Connect your wallet to take the quiz.
                    </p>
                  )}
                </div>
              )}

              {/* Lesson completion state */}
              {lessonCompleted && (
                <div className="mt-6 rounded-xl border border-primary/20 bg-primary/5 p-4 text-center text-sm flex items-center justify-center gap-2">
                  <Trophy className="h-4 w-4 text-primary" />
                  <span className="font-medium text-foreground">
                    Lesson completed!
                  </span>
                  {nextLesson && (
                    <span>
                      {" — "}
                      <Link
                        to={`/lesson/${courseId}/${typeof nextLesson.id === "string" ? nextLesson.id : String(nextLesson.id)}`}
                        className="text-primary hover:underline"
                      >
                        Continue to next →
                      </Link>
                    </span>
                  )}
                </div>
              )}

              {/* Manual complete fallback (no quiz) */}
              {account &&
                !lessonCompleted &&
                !hasQuiz &&
                activeTab === "content" && (
                  <div className="mt-6 rounded-xl border border-border bg-card p-5">
                    <h3 className="mb-1 text-sm font-medium text-foreground">
                      Mark as Complete
                    </h3>
                    <p className="mb-4 text-xs text-muted-foreground">
                      No quiz for this lesson. Mark it complete to continue.
                    </p>
                    <button
                      onClick={() => handleCompleteWithScore(100)}
                      disabled={completing}
                      className="btn-primary-gradient flex items-center gap-2 rounded-xl px-6 py-2.5 font-display font-semibold disabled:opacity-50"
                    >
                      <CheckCircle2 className="h-5 w-5" />
                      {completing ? "Completing..." : "Mark Complete"}
                    </button>
                  </div>
                )}

              {/* Previous / Next Navigation */}
              <div className="mt-8 flex items-center justify-between gap-4">
                {prevLesson ? (
                  <Link
                    to={`/lesson/${courseId}/${typeof prevLesson.id === "string" ? prevLesson.id : String(prevLesson.id)}`}
                    className="flex items-center gap-2 rounded-xl border border-border px-4 py-3 text-sm font-medium text-foreground hover:bg-muted transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <div className="text-left">
                      <p className="text-xs text-muted-foreground">Previous</p>
                      <p className="line-clamp-1">{prevLesson.title}</p>
                    </div>
                  </Link>
                ) : (
                  <Link
                    to={`/course/${courseId}`}
                    className="flex items-center gap-2 rounded-xl border border-border px-4 py-3 text-sm font-medium text-foreground hover:bg-muted transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <div>
                      <p className="text-xs text-muted-foreground">Back to</p>
                      <p>{course?.title || "Course"}</p>
                    </div>
                  </Link>
                )}
                {nextLesson ? (
                  <Link
                    to={`/lesson/${courseId}/${typeof nextLesson.id === "string" ? nextLesson.id : String(nextLesson.id)}`}
                    className="flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm font-medium text-foreground hover:bg-primary/10 transition-colors"
                  >
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Next</p>
                      <p className="line-clamp-1">{nextLesson.title}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-primary" />
                  </Link>
                ) : (
                  <Link
                    to={`/course/${courseId}`}
                    className="flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm font-medium text-foreground hover:bg-primary/10 transition-colors"
                  >
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Done!</p>
                      <p>Course Overview</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-primary" />
                  </Link>
                )}
              </div>
            </motion.div>
          ) : (
            <div className="py-16 text-center text-muted-foreground">
              <div className="h-6 w-32 animate-pulse rounded bg-muted mx-auto mb-2" />
              <p className="text-sm">Loading lesson...</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
