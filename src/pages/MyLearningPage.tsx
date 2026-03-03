import { Layout } from "@/components/layout/Layout";
import { useCourses, useStudentProgress, useStudentCertificates, useIssueCertificate } from "@/hooks/useAcademy";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { ProgressRing } from "@/components/progress/ProgressRing";
import { WalrusUploader } from "@/components/walrus/WalrusUploader";
import { motion } from "framer-motion";
import { BookOpen, Trophy, ArrowRight, Award, GraduationCap } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { toast } from "sonner";

export default function MyLearningPage() {
  const account = useCurrentAccount();
  const { data: courses } = useCourses();
  const { data: progress } = useStudentProgress();
  const { data: certificates } = useStudentCertificates();
  const issueCertificate = useIssueCertificate();
  const navigate = useNavigate();
  const [claimingCourseId, setClaimingCourseId] = useState<string | null>(null);
  const [certImageUrl, setCertImageUrl] = useState("https://moveacademy.io/cert-default.png");
  const [showCertUpload, setShowCertUpload] = useState<string | null>(null);

  if (!account) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <GraduationCap className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <h2 className="mb-2 font-display text-2xl font-bold text-foreground">Connect Your Wallet</h2>
          <p className="text-muted-foreground">Connect to track your learning progress.</p>
        </div>
      </Layout>
    );
  }

  // Group progress by course
  const progressByCourse: Record<string, any[]> = {};
  progress?.forEach((p: any) => {
    const cid = p.course_id;
    if (!progressByCourse[cid]) progressByCourse[cid] = [];
    progressByCourse[cid].push(p);
  });

  const certifiedCourseIds = new Set(certificates?.map((c: any) => c.course_id) || []);

  // Separate into in-progress and completed
  const courseEntries = Object.entries(progressByCourse).map(([courseId, lessons]) => {
    const course = courses?.find((c: any) => c.id === courseId);
    const lessonCount = Number(course?.lesson_count || 0);
    const completed = lessonCount > 0 && lessons.length >= lessonCount;
    return { courseId, course, lessons, lessonCount, completed, hasCert: certifiedCourseIds.has(courseId) };
  });

  const inProgress = courseEntries.filter((e) => !e.completed);
  const completedCourses = courseEntries.filter((e) => e.completed);

  const handleClaim = async (courseId: string) => {
    setClaimingCourseId(courseId);
    try {
      await issueCertificate(courseId, certImageUrl);
      toast.success("Certificate issued! 🎉");
      navigate("/certificates");
    } catch (e: any) {
      if (e.message?.includes("ECertificateAlreadyIssued")) {
        toast.error("You already have a certificate for this course");
      } else {
        toast.error(e.message || "Failed to issue certificate");
      }
    } finally {
      setClaimingCourseId(null);
      setShowCertUpload(null);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="mb-2 font-display text-3xl font-bold text-foreground">My Learning</h1>
          <p className="mb-8 text-muted-foreground">Track your progress across all courses</p>
        </motion.div>

        {/* In Progress */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-center gap-2 font-display text-xl font-bold text-foreground">
            <BookOpen className="h-5 w-5 text-primary" /> In Progress
          </h2>
          {inProgress.length > 0 ? (
            <div className="space-y-4">
              {inProgress.map(({ courseId, course, lessons, lessonCount }) => {
                const pct = lessonCount > 0 ? (lessons.length / lessonCount) * 100 : 0;
                return (
                  <div key={courseId} className="flex items-center gap-4 rounded-xl border border-border bg-card p-5 shadow-card">
                    <ProgressRing progress={pct} size={64} strokeWidth={5} />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display font-semibold text-card-foreground line-clamp-1">
                        {course?.title || `Course ${courseId.slice(0, 8)}...`}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {lessons.length} / {lessonCount} lessons completed
                      </p>
                    </div>
                    <Link
                      to={`/course/${courseId}`}
                      className="flex items-center gap-1 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                    >
                      Continue <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border bg-muted/30 p-8 text-center text-sm text-muted-foreground">
              No courses in progress. <Link to="/courses" className="text-primary hover:underline">Browse courses →</Link>
            </div>
          )}
        </section>

        {/* Completed */}
        <section>
          <h2 className="mb-4 flex items-center gap-2 font-display text-xl font-bold text-foreground">
            <Trophy className="h-5 w-5 text-accent" /> Completed
          </h2>
          {completedCourses.length > 0 ? (
            <div className="space-y-4">
              {completedCourses.map(({ courseId, course, lessonCount, hasCert }) => (
                <div key={courseId} className="rounded-xl border border-primary/20 bg-primary/5 p-5">
                  <div className="flex items-center gap-4">
                    <ProgressRing progress={100} size={64} strokeWidth={5} />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display font-semibold text-card-foreground line-clamp-1">
                        {course?.title || `Course ${courseId.slice(0, 8)}...`}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {lessonCount} / {lessonCount} lessons · All complete
                      </p>
                    </div>
                    {hasCert ? (
                      <Link to="/certificates" className="flex items-center gap-1 rounded-full bg-accent/10 px-3 py-1.5 text-xs font-medium text-accent hover:bg-accent/20 transition-colors">
                        <Award className="h-3.5 w-3.5" /> View Certificate
                      </Link>
                    ) : (
                      <button
                        onClick={() => setShowCertUpload(showCertUpload === courseId ? null : courseId)}
                        disabled={claimingCourseId === courseId}
                        className="btn-primary-gradient flex items-center gap-1 rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-50"
                      >
                        <Award className="h-4 w-4" />
                        {claimingCourseId === courseId ? "Claiming..." : "Claim Certificate"}
                      </button>
                    )}
                  </div>

                  {/* Certificate image upload */}
                  {showCertUpload === courseId && !hasCert && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-4 border-t border-border pt-4 space-y-3">
                      <WalrusUploader
                        label="Certificate Image (optional)"
                        onUploaded={(url) => setCertImageUrl(url)}
                        accept="image/*"
                      />
                      <p className="text-xs text-muted-foreground">Or use default certificate image</p>
                      <button
                        onClick={() => handleClaim(courseId)}
                        disabled={claimingCourseId === courseId}
                        className="btn-primary-gradient w-full rounded-xl py-2.5 font-display font-semibold disabled:opacity-50"
                      >
                        <Award className="mr-2 inline h-4 w-4" />
                        {claimingCourseId === courseId ? "Issuing..." : "Issue Certificate NFT"}
                      </button>
                    </motion.div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border bg-muted/30 p-8 text-center text-sm text-muted-foreground">
              Complete a course to see it here!
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
}
