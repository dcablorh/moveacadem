import { Layout } from "@/components/layout/Layout";
import { PageBreadcrumb } from "@/components/layout/PageBreadcrumb";
import { useCreateCourse, useAdminCaps } from "@/hooks/useAcademy";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { useState } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { BookOpen, ArrowLeft, Rocket } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export default function CreatePage() {
  const account = useCurrentAccount();
  const { data: adminCaps } = useAdminCaps();
  const isAdmin = (adminCaps?.length || 0) > 0;

  if (!account) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h2 className="mb-4 font-display text-2xl font-bold text-foreground">Connect Your Wallet</h2>
          <p className="text-muted-foreground">You need to connect a Sui wallet to create courses.</p>
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
        <h1 className="mb-2 font-display text-3xl font-bold text-foreground">Create New Course</h1>
        {isAdmin && (
          <p className="mb-2 text-sm text-muted-foreground">As an admin you may skip the usual approval process.</p>
        )}
        <p className="mb-8 text-muted-foreground">
          Start building your course. After creation, you'll be taken to the management screen to add lessons and exercises.
        </p>
        <CreateCourseForm />
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
      const courseId = await createCourse(title, description);
      toast.success("Course created! Let's add some lessons.");
      if (courseId) {
        navigate(`/course/${courseId}`);
      } else {
        // Fallback: go to courses page if we couldn't extract the ID
        navigate("/courses");
      }
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
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What will students learn in this course?" rows={4} className="w-full resize-none rounded-xl border border-input bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" required />
      </div>
      <button type="submit" disabled={loading || !title.trim() || !description.trim()} className="btn-primary-gradient w-full inline-flex items-center justify-center gap-2 rounded-xl py-3 font-display font-semibold disabled:opacity-50">
        <Rocket className="h-5 w-5" />
        {loading ? "Creating Course..." : "Create Course"}
      </button>
    </motion.form>
  );
}
