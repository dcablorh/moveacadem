import { Layout } from "@/components/layout/Layout";
import {
  useCourse,
  useCourseLessons,
  useOwnerCaps,
  usePublishCourse,
  useUpdateCourse,
  useStudentProgress,
  useIssueCertificate,
  useCreateLesson,
  useCreateExercise,
  useLessonExercises,
  useStudentCertificates,
} from "@/hooks/useAcademy";
import { useParams, useNavigate, Link } from "react-router-dom";
import { LessonItem } from "@/components/courses/LessonItem";
import { ProgressRing } from "@/components/progress/ProgressRing";
import { WalrusUploader } from "@/components/walrus/WalrusUploader";
import { motion } from "framer-motion";
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
  Image,
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
  const { data: certificates } = useStudentCertificates();
  const publishCourse = usePublishCourse();
  const updateCourse = useUpdateCourse();
  const issueCertificate = useIssueCertificate();
  const createLesson = useCreateLesson();
  const createExercise = useCreateExercise();
  const [publishing, setPublishing] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [saving, setSaving] = useState(false);
  const [showAddLesson, setShowAddLesson] = useState(false);
  const [showAddExercise, setShowAddExercise] = useState<string | null>(null);
  const [certImageUrl, setCertImageUrl] = useState("https://moveacademy.io/cert-default.png");
  const [showCertForm, setShowCertForm] = useState(false);

  const isOwner = caps?.some((c: any) => c.course_id === courseId);
  const ownerCap = caps?.find((c: any) => c.course_id === courseId);
  const hasCertificate = certificates?.some((c: any) => c.course_id === courseId);

  const completedLessonIds = new Set(
    progress
      ?.filter((p: any) => p.course_id === courseId)
      .map((p: any) => p.lesson_id) || []
  );

  const lessonCount = Number(course?.lesson_count || 0);
  const completedCount = completedLessonIds.size;
  const progressPct = lessonCount > 0 ? (completedCount / lessonCount) * 100 : 0;
  const courseCompleted = lessonCount > 0 && completedCount >= lessonCount;

  const handlePublish = async () => {
    if (!ownerCap) return;
    setPublishing(true);
    try {
      await publishCourse(courseId!, ownerCap.id);
      toast.success("Course published!");
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
        {/* Course Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="mb-3 flex items-center gap-2">
                {course.published ? (
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">Published</span>
                ) : (
                  <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">Draft</span>
                )}
                {isOwner && (
                  <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                    <Settings className="mr-1 inline h-3 w-3" /> You own this course
                  </span>
                )}
              </div>

              {editing ? (
                <div className="mb-4 space-y-3">
                  <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="w-full rounded-xl border border-input bg-card px-4 py-2.5 text-lg font-bold text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
                  <textarea value={editDesc} onChange={(e) => setEditDesc(e.target.value)} rows={3} className="w-full rounded-xl border border-input bg-card px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
                  <div className="flex gap-2">
                    <button onClick={handleSaveEdit} disabled={saving} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
                      {saving ? "Saving..." : "Save Changes"}
                    </button>
                    <button onClick={() => setEditing(false)} className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted">
                      <X className="mr-1 inline h-4 w-4" /> Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <h1 className="mb-3 font-display text-3xl font-bold text-foreground md:text-4xl">{course.title}</h1>
                  <p className="mb-4 max-w-2xl text-muted-foreground">{course.description}</p>
                </>
              )}

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5"><BookOpen className="h-4 w-4" />{lessonCount} lessons</span>
                <span className="flex items-center gap-1.5"><User className="h-4 w-4" />{course.creator?.slice(0, 6)}...{course.creator?.slice(-4)}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {account && lessonCount > 0 && <ProgressRing progress={progressPct} />}
            </div>
          </div>
        </motion.div>

        {/* Owner Actions Panel */}
        {isOwner && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-8 rounded-xl border border-border bg-card p-5 shadow-card">
            <h3 className="mb-4 flex items-center gap-2 font-display text-sm font-semibold text-foreground">
              <Settings className="h-4 w-4 text-primary" /> Course Management
            </h3>
            <div className="flex flex-wrap gap-3">
              {!course.published && (
                <button onClick={handlePublish} disabled={publishing} className="btn-primary-gradient inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold disabled:opacity-50">
                  <Upload className="h-4 w-4" />{publishing ? "Publishing..." : "Publish Course"}
                </button>
              )}
              {!editing && (
                <button onClick={handleEdit} className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors">
                  <Pencil className="h-4 w-4" /> Edit Course Info
                </button>
              )}
              <button onClick={() => setShowAddLesson(!showAddLesson)} className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors">
                <Plus className="h-4 w-4" /> Add Lesson
              </button>
            </div>
          </motion.div>
        )}

        {/* Inline Add Lesson Form */}
        {showAddLesson && ownerCap && (
          <AddLessonInline courseId={courseId!} capId={ownerCap.id} createLesson={createLesson} onClose={() => setShowAddLesson(false)} nextOrder={(lessons?.length || 0) + 1} />
        )}

        {/* Certificate claim */}
        {account && courseCompleted && course.published && !hasCertificate && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mb-8 rounded-xl border border-primary/30 bg-primary/5 p-6">
            <div className="text-center">
              <Award className="mx-auto mb-3 h-10 w-10 text-primary" />
              <h3 className="mb-1 font-display text-lg font-bold text-foreground">Course Complete! 🎉</h3>
              <p className="mb-4 text-sm text-muted-foreground">You've completed all {lessonCount} lessons. Claim your soulbound certificate NFT!</p>
            </div>
            {!showCertForm ? (
              <div className="text-center">
                <button onClick={() => setShowCertForm(true)} className="btn-primary-gradient inline-flex items-center gap-2 rounded-xl px-6 py-3 font-display font-semibold">
                  <Award className="h-5 w-5" /> Claim Certificate
                </button>
              </div>
            ) : (
              <div className="mx-auto max-w-md space-y-4">
                <WalrusUploader
                  label="Certificate Image (optional)"
                  onUploaded={(url) => setCertImageUrl(url)}
                  accept="image/*"
                />
                <p className="text-xs text-muted-foreground">Or use default certificate image</p>
                <button onClick={handleClaimCertificate} disabled={claiming} className="btn-primary-gradient w-full rounded-xl py-3 font-display font-semibold disabled:opacity-50">
                  <Award className="mr-2 inline h-5 w-5" />
                  {claiming ? "Issuing..." : "Issue Certificate NFT"}
                </button>
              </div>
            )}
          </motion.div>
        )}

        {hasCertificate && (
          <div className="mb-8 rounded-xl border border-accent/30 bg-accent/5 p-4 text-center text-sm">
            <Award className="mr-1 inline h-4 w-4 text-accent" />
            <span className="font-medium text-foreground">You already have a certificate for this course.</span>{" "}
            <Link to="/certificates" className="text-primary hover:underline">View certificates →</Link>
          </div>
        )}

        {/* Lessons */}
        <div className="max-w-2xl">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-xl font-bold text-foreground">Lessons</h2>
            {isOwner && (
              <button onClick={() => setShowAddLesson(true)} className="flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                <Plus className="h-4 w-4" /> Add
              </button>
            )}
          </div>
          {lessons && lessons.length > 0 ? (
            <div className="space-y-3">
              {lessons.map((lesson: any, idx: number) => (
                <div key={lesson.id}>
                  <LessonItem
                    title={lesson.title}
                    order={idx + 1}
                    completed={completedLessonIds.has(lesson.id)}
                    onClick={() => navigate(`/lesson/${courseId}/${lesson.id}`)}
                  />
                  {/* Add Exercise button per lesson (owner only) */}
                  {isOwner && (
                    <div className="ml-14 mt-1">
                      {showAddExercise === lesson.id ? (
                        <AddExerciseInline lessonId={lesson.id} capId={ownerCap!.id} createExercise={createExercise} onClose={() => setShowAddExercise(null)} />
                      ) : (
                        <button onClick={() => setShowAddExercise(lesson.id)} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
                          <Dumbbell className="h-3 w-3" /> Add Exercise
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border bg-muted/30 p-8 text-center text-sm text-muted-foreground">
              No lessons added yet.
              {isOwner && (
                <button onClick={() => setShowAddLesson(true)} className="mt-2 block w-full text-primary hover:underline">
                  Add your first lesson →
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

// Inline Add Lesson with Walrus upload
function AddLessonInline({ courseId, capId, createLesson, onClose, nextOrder }: {
  courseId: string; capId: string; createLesson: any; onClose: () => void; nextOrder: number;
}) {
  const [title, setTitle] = useState("");
  const [contentUri, setContentUri] = useState("");
  const [quizUri, setQuizUri] = useState("");
  const [order, setOrder] = useState(nextOrder);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !contentUri || !quizUri) { toast.error("Fill all fields"); return; }
    setLoading(true);
    try {
      await createLesson(courseId, capId, title, contentUri, quizUri, order);
      toast.success("Lesson added!");
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Failed to create lesson");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.form initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} onSubmit={handleSubmit} className="mb-8 rounded-xl border border-primary/30 bg-primary/5 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-sm font-semibold text-foreground">Add New Lesson</h3>
        <button type="button" onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-foreground">Title</label>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Variables and Types" className="w-full rounded-xl border border-input bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" required />
      </div>
      <WalrusUploader label="Lesson Content" onUploaded={(url) => setContentUri(url)} placeholder="Write your lesson content here (markdown)..." />
      <WalrusUploader label="Quiz Content" onUploaded={(url) => setQuizUri(url)} placeholder="Write quiz questions here..." />
      <div>
        <label className="mb-1 block text-sm font-medium text-foreground">Order</label>
        <input type="number" value={order} onChange={(e) => setOrder(Number(e.target.value))} min={1} className="w-24 rounded-xl border border-input bg-card px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
      </div>
      <button type="submit" disabled={loading || !contentUri || !quizUri} className="btn-primary-gradient w-full rounded-xl py-3 font-display font-semibold disabled:opacity-50">
        {loading ? "Adding..." : "Add Lesson"}
      </button>
    </motion.form>
  );
}

// Inline Add Exercise with Walrus upload
function AddExerciseInline({ lessonId, capId, createExercise, onClose }: {
  lessonId: string; capId: string; createExercise: any; onClose: () => void;
}) {
  const [title, setTitle] = useState("");
  const [exerciseUri, setExerciseUri] = useState("");
  const [maxScore, setMaxScore] = useState(100);
  const [masteryThreshold, setMasteryThreshold] = useState(80);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !exerciseUri) { toast.error("Fill all fields"); return; }
    setLoading(true);
    try {
      await createExercise(lessonId, capId, title, exerciseUri, maxScore, masteryThreshold);
      toast.success("Exercise created!");
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Failed to create exercise");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.form initial={{ opacity: 0 }} animate={{ opacity: 1 }} onSubmit={handleSubmit} className="mt-2 rounded-xl border border-border bg-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-semibold text-foreground">Add Exercise</h4>
        <button type="button" onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="h-3.5 w-3.5" /></button>
      </div>
      <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Exercise title" className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" required />
      <WalrusUploader label="Exercise Content" onUploaded={(url) => setExerciseUri(url)} placeholder="Write exercise content..." />
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Max Score</label>
          <input type="number" value={maxScore} onChange={(e) => setMaxScore(Number(e.target.value))} min={1} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Mastery Threshold</label>
          <input type="number" value={masteryThreshold} onChange={(e) => setMasteryThreshold(Number(e.target.value))} min={1} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
        </div>
      </div>
      <button type="submit" disabled={loading || !exerciseUri} className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
        {loading ? "Creating..." : "Create Exercise"}
      </button>
    </motion.form>
  );
}
