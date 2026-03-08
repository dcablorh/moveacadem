import { Layout } from "@/components/layout/Layout";
import { PageBreadcrumb } from "@/components/layout/PageBreadcrumb";
import {
  useCourse,
  useCourseLessons,
  useOwnerCaps,
  useAdminCaps,
  usePublishCourse,
  useUpdateCourse,
  useStudentProgress,
  useIssueCertificate,
  useCreateLesson,
  useCreateExercise,
  useLessonExercises,
  useStudentCertificates,
  useCourseExerciseCounts,
} from "@/hooks/useAcademy";
import { LESSON_REGISTRY_ID } from "@/config/sui";
import { useParams, useNavigate, Link } from "react-router-dom";
import { LessonItem } from "@/components/courses/LessonItem";
import { ProgressRing } from "@/components/progress/ProgressRing";
import { WalrusUploader } from "@/components/walrus/WalrusUploader";
import { QuizBuilder } from "@/components/walrus/QuizBuilder";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  User,
  Award,
  Pencil,
  X,
  Plus,
  Dumbbell,
  Settings,
  Upload,
  CheckCircle2,
  Circle,
  AlertTriangle,
  Rocket,
  Eye,
} from "lucide-react";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { useState } from "react";
import { toast } from "sonner";

export default function CourseDetailPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const account = useCurrentAccount();
  const { data: course, isLoading } = useCourse(courseId);
  const { data: lessons } = useCourseLessons(courseId);
  const { data: progress } = useStudentProgress();
  const { data: caps } = useOwnerCaps();
  const { data: adminCaps } = useAdminCaps();
  const isAdmin = (adminCaps?.length || 0) > 0;
  const { data: certificates } = useStudentCertificates();
  const { data: exerciseCounts } = useCourseExerciseCounts(courseId);
  const publishCourse = usePublishCourse();
  const updateCourse = useUpdateCourse();
  const issueCertificate = useIssueCertificate();
  const createLesson = useCreateLesson();
  const createExercise = useCreateExercise();

  const [publishing, setPublishing] = useState(false);
  const [showPublishConfirm, setShowPublishConfirm] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [saving, setSaving] = useState(false);
  const [showAddLesson, setShowAddLesson] = useState(false);
  const [showAddExercise, setShowAddExercise] = useState<string | null>(null);
  const [certImageUrl, setCertImageUrl] = useState(
    "https://moveacademy.io/cert-default.png",
  );
  const [showCertForm, setShowCertForm] = useState(false);

  const isOwner = caps?.some((c: any) => c.course_id === courseId);
  const ownerCap = caps?.find((c: any) => c.course_id === courseId);
  const hasCertificate = certificates?.some(
    (c: any) => c.course_id === courseId,
  );

  const completedLessonIds = new Set(
    progress
      ?.filter((p: any) => p.course_id === courseId)
      .map((p: any) => p.lesson_id) || [],
  );

  const lessonCount = Number(course?.lesson_count || 0);
  const completedCount = completedLessonIds.size;
  const progressPct =
    lessonCount > 0 ? (completedCount / lessonCount) * 100 : 0;
  const courseCompleted = lessonCount > 0 && completedCount >= lessonCount;

  // Exercise counts for readiness
  const lessonIds = lessons?.map((l: any) => l.id) || [];
  const totalExercises = lessonIds.reduce(
    (sum, lid) => sum + (exerciseCounts?.perLesson[lid] || 0),
    0,
  );

  const handlePublish = async () => {
    if (!ownerCap) return;
    setPublishing(true);
    try {
      await publishCourse(courseId!, ownerCap.id);
      toast.success("Course published! Students can now start learning.");
      setShowPublishConfirm(false);
      navigate(`/publish-success/${courseId}`);
    } catch (e: any) {
      toast.error(e.message || "Failed to publish");
    } finally {
      setPublishing(false);
    }
  };

  const handleEdit = () => {
    setEditTitle(course?.title || "");
    setEditDesc(course?.description || "");
    setEditing(true);
  };

  const handleSaveEdit = async () => {
    if (!ownerCap) return;
    setSaving(true);
    try {
      await updateCourse(courseId!, ownerCap.id, editTitle, editDesc);
      toast.success("Course updated!");
      setEditing(false);
    } catch (e: any) {
      toast.error(e.message || "Failed to update");
    } finally {
      setSaving(false);
    }
  };

  const handleClaimCertificate = async () => {
    setClaiming(true);
    try {
      await issueCertificate(courseId!, certImageUrl);
      toast.success("Certificate issued! Check your certificates page.");
      setShowCertForm(false);
    } catch (e: any) {
      toast.error(e.message || "Failed to issue certificate");
    } finally {
      setClaiming(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16">
          <div className="h-8 w-64 animate-pulse rounded bg-muted mb-4" />
          <div className="h-4 w-96 animate-pulse rounded bg-muted" />
        </div>
      </Layout>
    );
  }

  if (!course) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center text-muted-foreground">
          Course not found
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-10">
        <PageBreadcrumb items={[
          { label: "Home", to: "/" },
          { label: "Courses", to: "/courses" },
          { label: course.title },
        ]} />
        {/* Course Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                {course.published ? (
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                    ✓ Published
                  </span>
                ) : (
                  <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
                    Draft — Unpublished
                  </span>
                )}
                {isOwner && (
                  <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                    <Settings className="mr-1 inline h-3 w-3" /> You own this
                    course
                  </span>
                )}
                {!isOwner && !course.published && (
                  <span className="text-xs text-muted-foreground italic">
                    This course is not yet available for students
                  </span>
                )}
              </div>

              {editing ? (
                <div className="mb-4 space-y-3">
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full rounded-xl border border-input bg-card px-4 py-2.5 text-lg font-bold text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <textarea
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    rows={3}
                    className="w-full rounded-xl border border-input bg-card px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveEdit}
                      disabled={saving}
                      className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                    >
                      {saving ? "Saving..." : "Save Changes"}
                    </button>
                    <button
                      onClick={() => setEditing(false)}
                      className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
                    >
                      <X className="mr-1 inline h-4 w-4" /> Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <h1 className="mb-3 font-display text-3xl font-bold text-foreground md:text-4xl">
                    {course.title}
                  </h1>
                  <p className="mb-4 max-w-2xl text-muted-foreground">
                    {course.description}
                  </p>
                </>
              )}

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <BookOpen className="h-4 w-4" />
                  {lessonCount} lessons
                </span>
                <span className="flex items-center gap-1.5">
                  <Dumbbell className="h-4 w-4" />
                  {totalExercises} exercises
                </span>
                <span className="flex items-center gap-1.5">
                  <User className="h-4 w-4" />
                  {course.creator?.slice(0, 6)}...{course.creator?.slice(-4)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {account && lessonCount > 0 && !isOwner && (
                <ProgressRing progress={progressPct} />
              )}
              {isOwner && !course.published && (
                <div className="text-right text-xs text-muted-foreground">
                  <p>
                    Lessons:{" "}
                    <span className="font-semibold text-foreground">
                      {lessonCount}
                    </span>
                  </p>
                  <p>
                    Exercises:{" "}
                    <span className="font-semibold text-foreground">
                      {totalExercises}
                    </span>
                  </p>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* ===== OWNER SECTION ===== */}
        {isOwner && (
          <>
            {/* Course Management Bar */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-6 rounded-xl border border-border bg-card p-5 shadow-card"
            >
              <h3 className="mb-4 flex items-center gap-2 font-display text-sm font-semibold text-foreground">
                <Settings className="h-4 w-4 text-primary" /> Course Management
              </h3>
              <div className="flex flex-wrap gap-3">
                {!editing && (
                  <button
                    onClick={handleEdit}
                    className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors"
                  >
                    <Pencil className="h-4 w-4" /> Edit Course Info
                  </button>
                )}
                <button
                  onClick={() => setShowAddLesson(!showAddLesson)}
                  className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors"
                >
                  <Plus className="h-4 w-4" />{" "}
                  {lessonCount === 0 ? "Add First Lesson" : "Add Next Lesson"}
                </button>
                {course.published ? (
                  <button
                    onClick={() => navigate(`/course/${courseId}`)}
                    className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors"
                  >
                    <Eye className="h-4 w-4" /> View as Student
                  </button>
                ) : lessonCount > 0 ? (
                  <button
                    onClick={() => navigate(`/course/${courseId}`)}
                    className="inline-flex items-center gap-2 rounded-lg border border-yellow-500/50 bg-yellow-500/10 px-4 py-2.5 text-sm font-medium text-yellow-600 hover:bg-yellow-500/20 transition-colors"
                  >
                    <Eye className="h-4 w-4" /> Live Preview
                  </button>
                ) : null}
              </div>
            </motion.div>

            {/* Course Readiness Checklist (only if not published) */}
            {!course.published && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="mb-8 rounded-xl border border-border bg-card p-5 shadow-card"
              >
                <h3 className="mb-4 font-display text-sm font-semibold text-foreground">
                  📋 Course Readiness Checklist
                </h3>
                <div className="space-y-2.5">
                  <ChecklistItem checked label="Course created" />
                  <ChecklistItem
                    checked={lessonCount > 0}
                    label={`Lessons added (${lessonCount})`}
                  />
                  <ChecklistItem
                    checked={totalExercises > 0}
                    label={`Exercises created (${totalExercises})`}
                  />
                </div>

                <div className="mt-6">
                  {lessonCount > 0 ? (
                    <>
                      <button
                        onClick={() => setShowPublishConfirm(true)}
                        className="btn-primary-gradient inline-flex items-center gap-2 rounded-xl px-6 py-3 font-display font-semibold text-lg shadow-glow"
                      >
                        <Rocket className="h-5 w-5" /> Publish Course
                      </button>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">
                      Add at least one lesson before publishing.
                    </p>
                  )}
                </div>
              </motion.div>
            )}

            {/* Publish Confirmation Dialog */}
            <AnimatePresence>
              {showPublishConfirm && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
                  onClick={() => setShowPublishConfirm(false)}
                >
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-card-hover"
                  >
                    <div className="mb-4 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10">
                        <AlertTriangle className="h-5 w-5 text-accent" />
                      </div>
                      <h3 className="font-display text-lg font-bold text-foreground">
                        Publish Course?
                      </h3>
                    </div>
                    <p className="mb-2 text-sm text-muted-foreground">
                      This action is{" "}
                      <span className="font-semibold text-foreground">
                        irreversible
                      </span>
                      . Once published, students can start taking the course
                      immediately.
                    </p>
                    <div className="mb-4 rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
                      <p>
                        <span className="font-medium text-foreground">
                          "{course.title}"
                        </span>
                      </p>
                      <p>
                        {lessonCount} lessons · {totalExercises} exercises
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={handlePublish}
                        disabled={publishing}
                        className="btn-primary-gradient flex-1 rounded-xl py-2.5 font-display font-semibold disabled:opacity-50"
                      >
                        {publishing ? "Publishing..." : "Yes, Publish"}
                      </button>
                      <button
                        onClick={() => setShowPublishConfirm(false)}
                        className="flex-1 rounded-xl border border-border py-2.5 text-sm font-medium text-foreground hover:bg-muted"
                      >
                        Cancel
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Inline Add Lesson Form */}
            <AnimatePresence>
              {showAddLesson && ownerCap && (
                <AddLessonInline
                  courseId={courseId!}
                  capId={ownerCap.id}
                  createLesson={createLesson}
                  onClose={() => setShowAddLesson(false)}
                  nextOrder={(lessons?.length || 0) + 1}
                />
              )}
            </AnimatePresence>
          </>
        )}

        {/* ===== STUDENT: Certificate Claim ===== */}
        {account &&
          !isOwner &&
          courseCompleted &&
          course.published &&
          !hasCertificate && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-8 rounded-xl border border-primary/30 bg-primary/5 p-6"
            >
              <div className="text-center">
                <Award className="mx-auto mb-3 h-10 w-10 text-primary" />
                <h3 className="mb-1 font-display text-lg font-bold text-foreground">
                  Course Complete! 🎉
                </h3>
                <p className="mb-4 text-sm text-muted-foreground">
                  You've completed all {lessonCount} lessons. Claim your
                  soulbound certificate NFT!
                </p>
              </div>
              {!showCertForm ? (
                <div className="text-center">
                  <button
                    onClick={() => setShowCertForm(true)}
                    className="btn-primary-gradient inline-flex items-center gap-2 rounded-xl px-6 py-3 font-display font-semibold"
                  >
                    <Award className="h-5 w-5" /> Claim Certificate
                  </button>
                </div>
              ) : (
                <div className="mx-auto max-w-md space-y-4">
                  {/* NFT Previewer */}
                  <div className="relative mx-auto mt-4 overflow-hidden rounded-xl border-4 border-primary/20 bg-muted shadow-xl aspect-[4/3]">
                    <img
                      src={
                        certImageUrl ||
                        "https://moveacademy.io/cert-default.png"
                      }
                      alt="Certificate Preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-black/40 backdrop-blur-[2px]">
                      <h2 className="mb-2 font-display text-3xl font-bold text-white drop-shadow-md">
                        {course?.title}
                      </h2>
                      <p className="font-medium text-white/90 drop-shadow-sm">
                        Mastered by
                      </p>
                      <p className="mt-1 rounded-full bg-black/60 px-3 py-1 font-mono text-sm text-primary drop-shadow-md">
                        {account?.address.slice(0, 6)}...
                        {account?.address.slice(-4)}
                      </p>
                    </div>
                  </div>

                  <WalrusUploader
                    label="Custom Image (optional)"
                    onUploaded={(url) => setCertImageUrl(url)}
                    accept="image/*"
                  />
                  <p className="text-xs text-muted-foreground text-center">
                    Leave blank to use the default certificate image shown
                    above.
                  </p>
                  <button
                    onClick={handleClaimCertificate}
                    disabled={claiming}
                    className="btn-primary-gradient w-full rounded-xl py-3 font-display font-semibold disabled:opacity-50"
                  >
                    <Award className="mr-2 inline h-5 w-5" />
                    {claiming ? "Issuing..." : "Issue Certificate NFT"}
                  </button>
                </div>
              )}
            </motion.div>
          )}

        {hasCertificate && (
          <div className="mb-8 rounded-xl border border-accent/20 bg-accent/5 p-8 text-center shadow-lg">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent/20">
              <Award className="h-8 w-8 text-accent" />
            </div>
            <h3 className="mb-2 font-display text-2xl font-bold text-foreground">
              Certificate Claimed!
            </h3>
            <p className="mb-6 text-muted-foreground">
              You have successfully minted your soulbound certificate.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`I just completed "${course?.title}" on Move Academy and earned my Soulbound Certificate! 🎓⚡\n\nCheck out my on-chain proof on Sui: @SuiNetwork`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-xl bg-[#1DA1F2] px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              >
                Share on X
              </a>
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-xl bg-[#0A66C2] px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              >
                Add to LinkedIn
              </a>
              <Link
                to="/certificates"
                className="flex items-center gap-2 rounded-xl border border-border px-6 py-3 text-sm font-semibold text-foreground hover:bg-muted transition-colors"
              >
                View Certificate
              </Link>
            </div>
          </div>
        )}

        {/* ===== LESSONS LIST ===== */}
        <div className="max-w-2xl">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-xl font-bold text-foreground">
              Lessons
            </h2>
            {isOwner && (
              <button
                onClick={() => setShowAddLesson(true)}
                className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
              >
                <Plus className="h-4 w-4" /> Add
              </button>
            )}
          </div>

          {lessons && lessons.length > 0 ? (
            <div className="space-y-3">
              {lessons.map((lesson: any, idx: number) => {
                const exCount = exerciseCounts?.perLesson[lesson.id] || 0;
                const hasQuiz = !!lesson.quiz_uri;
                const isWarning =
                  !course.published && !hasQuiz && exCount === 0;

                return (
                  <div key={lesson.id}>
                    <div className="relative">
                      {isWarning && isOwner && (
                        <div
                          className="absolute -left-3 -top-3 z-10 hidden md:flex items-center justify-center p-1 bg-yellow-500/20 text-yellow-600 rounded-full border border-yellow-500/50"
                          title="Warning: Lesson has no exercises or quiz."
                        >
                          <AlertTriangle className="h-4 w-4" />
                        </div>
                      )}
                      <LessonItem
                        title={lesson.title}
                        order={idx + 1}
                        completed={completedLessonIds.has(lesson.id)}
                        exerciseCount={exCount}
                        onClick={() =>
                          navigate(`/lesson/${courseId}/${lesson.id}`)
                        }
                      />
                      {isWarning && isOwner && (
                        <p className="md:hidden mt-1 text-xs text-yellow-600 flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" /> Warning: Lesson
                          has no exercises or quiz.
                        </p>
                      )}
                    </div>
                    {/* Add Exercise button per lesson (owner only) */}
                    {isOwner && (
                      <div className="ml-14 mt-1">
                        <AnimatePresence>
                          {showAddExercise === lesson.id ? (
                            <AddExerciseInline
                              lessonId={lesson.id}
                              capId={ownerCap!.id}
                              createExercise={createExercise}
                              onClose={() => setShowAddExercise(null)}
                            />
                          ) : (
                            <button
                              onClick={() => setShowAddExercise(lesson.id)}
                              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                            >
                              <Dumbbell className="h-3 w-3" />{" "}
                              {exCount > 0
                                ? `${exCount} exercises · Add more`
                                : "Add Exercise"}
                            </button>
                          )}
                        </AnimatePresence>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-xl border-2 border-dashed border-border bg-muted/30 p-10 text-center">
              <BookOpen className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
              <h3 className="mb-2 font-display text-lg font-semibold text-foreground">
                {isOwner
                  ? "Your course has no lessons yet"
                  : "No lessons available"}
              </h3>
              <p className="mb-4 text-sm text-muted-foreground">
                {isOwner
                  ? "Add your first lesson to start building content."
                  : "Check back later for new content."}
              </p>
              {isOwner && (
                <button
                  onClick={() => setShowAddLesson(true)}
                  className="btn-primary-gradient inline-flex items-center gap-2 rounded-xl px-6 py-3 font-display font-semibold"
                >
                  <Plus className="h-5 w-5" /> Add First Lesson
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

// Checklist item
function ChecklistItem({
  checked,
  label,
}: {
  checked: boolean;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2.5">
      {checked ? (
        <CheckCircle2 className="h-4.5 w-4.5 text-primary flex-shrink-0" />
      ) : (
        <Circle className="h-4.5 w-4.5 text-muted-foreground flex-shrink-0" />
      )}
      <span
        className={`text-sm ${checked ? "text-foreground" : "text-muted-foreground"}`}
      >
        {label}
      </span>
    </div>
  );
}

// Inline Add Lesson with Walrus upload
function AddLessonInline({
  courseId,
  capId,
  createLesson,
  onClose,
  nextOrder,
}: {
  courseId: string;
  capId: string;
  createLesson: any;
  onClose: () => void;
  nextOrder: number;
}) {
  if (!capId) {
    return (
      <p className="text-red-500">
        You must own the course owner capability to add lessons.
      </p>
    );
  }
  const [title, setTitle] = useState("");
  const [contentUri, setContentUri] = useState("");
  const [quizUri, setQuizUri] = useState("");
  const [order, setOrder] = useState(nextOrder);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !contentUri || !quizUri) {
      toast.error("Fill all fields");
      return;
    }
    setLoading(true);

    // guard missing identifiers
    if (!courseId || !capId) {
      console.error("missing courseId or capId before submit", {
        courseId,
        capId,
      });
      toast.error("Unable to add lesson: missing course information.");
      setLoading(false);
      return;
    }

    // log input values for debugging type errors
    console.debug("creating lesson with:", {
      courseId,
      capId,
      title,
      contentUri,
      quizUri,
      order,
      lessonRegistry: LESSON_REGISTRY_ID,
    });

    try {
      // make sure order is a number (should already be)
      const numericOrder = Number(order);
      await createLesson(
        courseId,
        capId,
        title,
        contentUri,
        quizUri,
        numericOrder,
      );
      toast.success("Lesson added!");
      onClose();
    } catch (err: any) {
      // print full error object to console for investigation
      console.error("createLesson failed", err);
      toast.error(err?.message || "Failed to create lesson");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      onSubmit={handleSubmit}
      className="mb-8 rounded-xl border border-primary/30 bg-primary/5 p-5 space-y-4"
    >
      <div className="flex items-center justify-between">
        <h3 className="font-display text-sm font-semibold text-foreground">
          {order === 1 ? "Add First Lesson" : `Add Lesson ${order}`}
        </h3>
        <button
          type="button"
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
          placeholder="e.g., Variables and Types"
          className="w-full rounded-xl border border-input bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          required
        />
      </div>
      <WalrusUploader
        label="Lesson Content"
        onUploaded={(url) => setContentUri(url)}
        placeholder="Write your lesson content here (markdown)..."
      />
      <QuizBuilder
        label="Quiz Questions"
        onUploaded={(url) => setQuizUri(url)}
      />
      <div>
        <label className="mb-1 block text-sm font-medium text-foreground">
          Order
        </label>
        <input
          type="number"
          value={order}
          onChange={(e) => setOrder(Number(e.target.value))}
          min={1}
          disabled // we compute this automatically
          className="w-24 rounded-xl border border-input bg-card/50 px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <p className="text-xs text-muted-foreground">
          lesson order is generated for you ({order})
        </p>
      </div>
      <button
        type="submit"
        disabled={loading || !contentUri || !quizUri}
        className="btn-primary-gradient w-full rounded-xl py-3 font-display font-semibold disabled:opacity-50"
      >
        {loading ? "Adding..." : "Add Lesson"}
      </button>
    </motion.form>
  );
}

// Inline Add Exercise with Walrus upload
function AddExerciseInline({
  lessonId,
  capId,
  createExercise,
  onClose,
}: {
  lessonId: string;
  capId: string;
  createExercise: any;
  onClose: () => void;
}) {
  if (!capId) {
    return (
      <p className="text-red-500">
        You must own the course owner capability to add exercises.
      </p>
    );
  }
  const [title, setTitle] = useState("");
  const [exerciseUri, setExerciseUri] = useState("");
  const [maxScore, setMaxScore] = useState(100);
  const [masteryThreshold, setMasteryThreshold] = useState(80);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !exerciseUri) {
      toast.error("Fill all fields");
      return;
    }
    setLoading(true);
    try {
      await createExercise(
        lessonId,
        capId,
        title,
        exerciseUri,
        maxScore,
        masteryThreshold,
      );
      toast.success("Exercise created!");
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Failed to create exercise");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onSubmit={handleSubmit}
      className="mt-2 rounded-xl border border-border bg-card p-4 space-y-3"
    >
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-semibold text-foreground">Add Exercise</h4>
        <button
          type="button"
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Exercise title"
        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        required
      />
      <WalrusUploader
        label="Exercise Content"
        onUploaded={(url) => setExerciseUri(url)}
        placeholder="Write exercise content..."
      />
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">
            Max Score
          </label>
          <input
            type="number"
            value={maxScore}
            onChange={(e) => setMaxScore(Number(e.target.value))}
            min={1}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">
            Mastery Threshold
          </label>
          <input
            type="number"
            value={masteryThreshold}
            onChange={(e) => setMasteryThreshold(Number(e.target.value))}
            min={1}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>
      <button
        type="submit"
        disabled={loading || !exerciseUri}
        className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
      >
        {loading ? "Creating..." : "Create Exercise"}
      </button>
    </motion.form>
  );
}
