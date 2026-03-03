import { Layout } from "@/components/layout/Layout";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useCourse } from "@/hooks/useAcademy";
import { motion } from "framer-motion";
import { Rocket, CheckCircle2, Share2, LayoutDashboard, Eye } from "lucide-react";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { useEffect } from "react";

export default function PublishSuccessPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const { data: course } = useCourse(courseId);
  const navigate = useNavigate();

  useEffect(() => {
    // Fire confetti on mount
    const end = Date.now() + 1500;
    const colors = ["#7c3aed", "#f59e0b", "#10b981"];
    (function frame() {
      confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0 }, colors });
      confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1 }, colors });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
  }, []);

  const handleShare = () => {
    const url = `${window.location.origin}/course/${courseId}`;
    navigator.clipboard.writeText(url);
    toast.success("Course link copied!");
  };

  return (
    <Layout>
      <div className="container mx-auto max-w-lg px-4 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 18 }}
          className="space-y-6"
        >
          {/* Icon */}
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
            <Rocket className="h-12 w-12 text-primary" />
          </div>

          {/* Text */}
          <div>
            <h1 className="font-display text-4xl font-bold text-foreground">
              🎉 Course Published!
            </h1>
            <p className="mt-3 text-lg text-muted-foreground">
              <span className="font-semibold text-foreground">
                {course?.title || "Your course"}
              </span>{" "}
              is now live on Move Academy.
            </p>
          </div>

          {/* Checklist */}
          <div className="rounded-2xl border border-border bg-card p-5 text-left space-y-3">
            {[
              "Course is publicly visible to all students",
              "Students can now enroll and start learning",
              "You'll see progress in your Analytics dashboard",
            ].map((item) => (
              <div key={item} className="flex items-start gap-2.5 text-sm text-foreground">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                {item}
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <Link
              to={`/course/${courseId}`}
              className="flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <Eye className="h-4 w-4" /> View Live Course
            </Link>
            <button
              onClick={handleShare}
              className="flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-6 py-3 text-sm font-medium text-foreground hover:bg-muted transition-colors"
            >
              <Share2 className="h-4 w-4" /> Share Course Link
            </button>
            <Link
              to="/courses"
              className="flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-6 py-3 text-sm font-medium text-foreground hover:bg-muted transition-colors"
            >
              <LayoutDashboard className="h-4 w-4" /> Back to Courses
            </Link>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}
