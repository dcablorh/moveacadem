import { Layout } from "@/components/layout/Layout";
import { useCreateCourse, useCreateLesson, useCreateExercise, useOwnerCaps, useCourseLessons } from "@/hooks/useAcademy";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { useState } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { BookOpen, FileText, ArrowLeft, Dumbbell } from "lucide-react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { WalrusUploader } from "@/components/walrus/WalrusUploader";

export default function CreatePage() {
  const account = useCurrentAccount();
  const [searchParams] = useSearchParams();
  const existingCourseId = searchParams.get("course");
  const tabParam = searchParams.get("tab");
  const defaultTab = tabParam === "exercise" ? "exercise" : existingCourseId ? "lesson" : "course";
  const [tab, setTab] = useState<"course" | "lesson" | "exercise">(defaultTab);

  if (!account) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h2 className="mb-4 font-display text-2xl font-bold text-foreground">Connect Your Wallet</h2>
          <p className="text-muted-foreground">You need to connect a Sui wallet to create courses and lessons.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto max-w-2xl px-4 py-10">
        <Link to="/courses" className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to courses
        </Link>
        <h1 className="mb-6 font-display text-3xl font-bold text-foreground">Creator Studio</h1>

        <div className="mb-8 flex gap-1 rounded-xl bg-muted p-1">
          {[
            { key: "course" as const, label: "New Course", icon: BookOpen },
            { key: "lesson" as const, label: "Add Lesson", icon: FileText },
            { key: "exercise" as const, label: "Add Exercise", icon: Dumbbell },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-all ${
                tab === t.key ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              <t.icon className="h-4 w-4" /> {t.label}
            </button>
          ))}
        </div>

        {tab === "course" && <CreateCourseForm />}
        {tab === "lesson" && <CreateLessonForm existingCourseId={existingCourseId} />}
        {tab === "exercise" && <CreateExerciseForm />}
      </div>
    </Layout>
  );
}

function CreateCourseForm() {
  const createCourse = useCreateCourse();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;
    setLoading(true);
    try {
      const result = await createCourse(title, description);
      toast.success("Course created successfully!");
      // Try to navigate to the new course
      // The result contains the transaction digest; courses page will show the new course
      navigate("/courses");
    } catch (err: any) {
      toast.error(err.message || "Failed to create course");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.form initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">Course Title</label>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Introduction to Move Programming" className="w-full rounded-xl border border-input bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" required />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">Description</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What will students learn?" rows={4} className="w-full resize-none rounded-xl border border-input bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" required />
      </div>
      <button type="submit" disabled={loading} className="btn-primary-gradient w-full rounded-xl py-3 font-display font-semibold disabled:opacity-50">
        {loading ? "Creating..." : "Create Course"}
      </button>
    </motion.form>
  );
}

function CreateLessonForm({ existingCourseId }: { existingCourseId: string | null }) {
  const { data: caps } = useOwnerCaps();
  const createLesson = useCreateLesson();
  const navigate = useNavigate();
  const [courseId, setCourseId] = useState(existingCourseId || "");
  const [title, setTitle] = useState("");
  const [contentUri, setContentUri] = useState("");
  const [quizUri, setQuizUri] = useState("");
  const [order, setOrder] = useState(1);
  const [loading, setLoading] = useState(false);

  const capForCourse = caps?.find((c: any) => c.course_id === courseId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!capForCourse) { toast.error("You don't own this course"); return; }
    if (!contentUri || !quizUri) { toast.error("Upload content and quiz to Walrus first"); return; }
    setLoading(true);
    try {
      await createLesson(courseId, capForCourse.id, title, contentUri, quizUri, order);
      toast.success("Lesson added!");
      setTitle(""); setContentUri(""); setQuizUri(""); setOrder(order + 1);
    } catch (err: any) {
      toast.error(err.message || "Failed to create lesson");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.form initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">Course ID</label>
        <input type="text" value={courseId} onChange={(e) => setCourseId(e.target.value)} placeholder="0x..." className="w-full rounded-xl border border-input bg-card px-4 py-2.5 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" required />
        {courseId && !capForCourse && <p className="mt-1 text-xs text-destructive">You don't have an owner cap for this course</p>}
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">Lesson Title</label>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Variables and Types" className="w-full rounded-xl border border-input bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" required />
      </div>
      <WalrusUploader label="Lesson Content" onUploaded={(url) => setContentUri(url)} placeholder="Write your lesson content (markdown supported)..." />
      <WalrusUploader label="Quiz Content" onUploaded={(url) => setQuizUri(url)} placeholder="Write quiz questions..." />
      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">Order</label>
        <input type="number" value={order} onChange={(e) => setOrder(Number(e.target.value))} min={1} className="w-24 rounded-xl border border-input bg-card px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
      </div>
      <button type="submit" disabled={loading || !capForCourse || !contentUri || !quizUri} className="btn-primary-gradient w-full rounded-xl py-3 font-display font-semibold disabled:opacity-50">
        {loading ? "Adding..." : "Add Lesson"}
      </button>
    </motion.form>
  );
}

function CreateExerciseForm() {
  const { data: caps } = useOwnerCaps();
  const createExercise = useCreateExercise();
  const [courseId, setCourseId] = useState("");
  const [lessonId, setLessonId] = useState("");
  const [title, setTitle] = useState("");
  const [exerciseUri, setExerciseUri] = useState("");
  const [maxScore, setMaxScore] = useState(100);
  const [masteryThreshold, setMasteryThreshold] = useState(80);
  const [loading, setLoading] = useState(false);

  const capForCourse = caps?.find((c: any) => c.course_id === courseId);
  const { data: lessons } = useCourseLessons(courseId || undefined);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!capForCourse) { toast.error("You don't own this course"); return; }
    if (!lessonId) { toast.error("Select a lesson"); return; }
    if (!exerciseUri) { toast.error("Upload exercise content to Walrus first"); return; }
    setLoading(true);
    try {
      await createExercise(lessonId, capForCourse.id, title, exerciseUri, maxScore, masteryThreshold);
      toast.success("Exercise created!");
      setTitle(""); setExerciseUri("");
    } catch (err: any) {
      toast.error(err.message || "Failed to create exercise");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.form initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">Course ID</label>
        <input type="text" value={courseId} onChange={(e) => setCourseId(e.target.value)} placeholder="0x..." className="w-full rounded-xl border border-input bg-card px-4 py-2.5 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" required />
        {courseId && !capForCourse && <p className="mt-1 text-xs text-destructive">You don't have an owner cap for this course</p>}
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">Lesson</label>
        {lessons && lessons.length > 0 ? (
          <select value={lessonId} onChange={(e) => setLessonId(e.target.value)} className="w-full rounded-xl border border-input bg-card px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" required>
            <option value="">Select a lesson...</option>
            {lessons.map((l: any) => (
              <option key={l.id} value={l.id}>{l.title} (Order: {l.order})</option>
            ))}
          </select>
        ) : (
          <input type="text" value={lessonId} onChange={(e) => setLessonId(e.target.value)} placeholder="Enter lesson ID or enter course ID above" className="w-full rounded-xl border border-input bg-card px-4 py-2.5 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" required />
        )}
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">Exercise Title</label>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Practice: Structs & Resources" className="w-full rounded-xl border border-input bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" required />
      </div>
      <WalrusUploader label="Exercise Content" onUploaded={(url) => setExerciseUri(url)} placeholder="Write exercise instructions..." />
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">Max Score</label>
          <input type="number" value={maxScore} onChange={(e) => setMaxScore(Number(e.target.value))} min={1} className="w-full rounded-xl border border-input bg-card px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">Mastery Threshold</label>
          <input type="number" value={masteryThreshold} onChange={(e) => setMasteryThreshold(Number(e.target.value))} min={1} className="w-full rounded-xl border border-input bg-card px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
        </div>
      </div>
      <button type="submit" disabled={loading || !capForCourse || !exerciseUri} className="btn-primary-gradient w-full rounded-xl py-3 font-display font-semibold disabled:opacity-50">
        {loading ? "Creating..." : "Create Exercise"}
      </button>
    </motion.form>
  );
}
