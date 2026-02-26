import { Layout } from "@/components/layout/Layout";
import { useCreateCourse, useCreateLesson, useOwnerCaps } from "@/hooks/useAcademy";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { useState } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { BookOpen, FileText, ArrowLeft } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";

export default function CreatePage() {
  const account = useCurrentAccount();
  const [searchParams] = useSearchParams();
  const existingCourseId = searchParams.get("course");
  const [tab, setTab] = useState<"course" | "lesson">(existingCourseId ? "lesson" : "course");

  if (!account) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h2 className="mb-4 font-display text-2xl font-bold text-foreground">
            Connect Your Wallet
          </h2>
          <p className="text-muted-foreground">
            You need to connect a Sui wallet to create courses and lessons.
          </p>
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

        <h1 className="mb-6 font-display text-3xl font-bold text-foreground">
          Creator Studio
        </h1>

        {/* Tab switcher */}
        <div className="mb-8 flex gap-1 rounded-xl bg-muted p-1">
          <button
            onClick={() => setTab("course")}
            className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-all ${
              tab === "course" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
            }`}
          >
            <BookOpen className="h-4 w-4" /> New Course
          </button>
          <button
            onClick={() => setTab("lesson")}
            className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-all ${
              tab === "lesson" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
            }`}
          >
            <FileText className="h-4 w-4" /> Add Lesson
          </button>
        </div>

        {tab === "course" ? <CreateCourseForm /> : <CreateLessonForm existingCourseId={existingCourseId} />}
      </div>
    </Layout>
  );
}

function CreateCourseForm() {
  const createCourse = useCreateCourse();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;
    setLoading(true);
    try {
      await createCourse(title, description);
      toast.success("Course created successfully!");
      setTitle("");
      setDescription("");
    } catch (err: any) {
      toast.error(err.message || "Failed to create course");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">
          Course Title
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Introduction to Move Programming"
          className="w-full rounded-xl border border-input bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          required
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What will students learn in this course?"
          rows={4}
          className="w-full resize-none rounded-xl border border-input bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          required
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="btn-primary-gradient w-full rounded-xl py-3 font-display font-semibold disabled:opacity-50"
      >
        {loading ? "Creating..." : "Create Course"}
      </button>
    </motion.form>
  );
}

function CreateLessonForm({ existingCourseId }: { existingCourseId: string | null }) {
  const { data: caps } = useOwnerCaps();
  const createLesson = useCreateLesson();
  const [courseId, setCourseId] = useState(existingCourseId || "");
  const [title, setTitle] = useState("");
  const [contentUri, setContentUri] = useState("");
  const [quizUri, setQuizUri] = useState("");
  const [order, setOrder] = useState(1);
  const [loading, setLoading] = useState(false);

  const capForCourse = caps?.find((c: any) => c.course_id === courseId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!capForCourse) {
      toast.error("You don't own this course");
      return;
    }
    setLoading(true);
    try {
      await createLesson(courseId, capForCourse.id, title, contentUri, quizUri, order);
      toast.success("Lesson added!");
      setTitle("");
      setContentUri("");
      setQuizUri("");
      setOrder(order + 1);
    } catch (err: any) {
      toast.error(err.message || "Failed to create lesson");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">
          Course ID
        </label>
        <input
          type="text"
          value={courseId}
          onChange={(e) => setCourseId(e.target.value)}
          placeholder="0x..."
          className="w-full rounded-xl border border-input bg-card px-4 py-2.5 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          required
        />
        {courseId && !capForCourse && (
          <p className="mt-1 text-xs text-destructive">You don't have an owner cap for this course</p>
        )}
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">
          Lesson Title
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

      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">
          Content URI (Walrus/IPFS)
        </label>
        <input
          type="text"
          value={contentUri}
          onChange={(e) => setContentUri(e.target.value)}
          placeholder="https://..."
          className="w-full rounded-xl border border-input bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          required
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">
          Quiz URI
        </label>
        <input
          type="text"
          value={quizUri}
          onChange={(e) => setQuizUri(e.target.value)}
          placeholder="https://..."
          className="w-full rounded-xl border border-input bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          required
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">
          Order
        </label>
        <input
          type="number"
          value={order}
          onChange={(e) => setOrder(Number(e.target.value))}
          min={1}
          className="w-24 rounded-xl border border-input bg-card px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      <button
        type="submit"
        disabled={loading || !capForCourse}
        className="btn-primary-gradient w-full rounded-xl py-3 font-display font-semibold disabled:opacity-50"
      >
        {loading ? "Adding..." : "Add Lesson"}
      </button>
    </motion.form>
  );
}
