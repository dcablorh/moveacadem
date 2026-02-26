import { Layout } from "@/components/layout/Layout";
import { useCourse, useCourseLessons, useOwnerCaps, usePublishCourse, useStudentProgress } from "@/hooks/useAcademy";
import { useParams, useNavigate } from "react-router-dom";
import { LessonItem } from "@/components/courses/LessonItem";
import { ProgressRing } from "@/components/progress/ProgressRing";
import { motion } from "framer-motion";
import { BookOpen, User, Clock, Settings } from "lucide-react";
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
  const publishCourse = usePublishCourse();
  const [publishing, setPublishing] = useState(false);

  const isOwner = caps?.some((c: any) => c.course_id === courseId);
  const ownerCap = caps?.find((c: any) => c.course_id === courseId);

  const completedLessonIds = new Set(
    progress?.filter((p: any) => p.course_id === courseId).map((p: any) => p.lesson_id) || []
  );

  const lessonCount = Number(course?.lesson_count || 0);
  const completedCount = completedLessonIds.size;
  const progressPct = lessonCount > 0 ? (completedCount / lessonCount) * 100 : 0;

  const handlePublish = async () => {
    if (!ownerCap) return;
    setPublishing(true);
    try {
      await publishCourse(courseId!, ownerCap.id);
      toast.success("Course published successfully!");
    } catch (e: any) {
      toast.error(e.message || "Failed to publish");
    } finally {
      setPublishing(false);
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="mb-3 flex items-center gap-2">
                {course.published ? (
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                    Published
                  </span>
                ) : (
                  <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
                    Draft
                  </span>
                )}
              </div>
              <h1 className="mb-3 font-display text-3xl font-bold text-foreground md:text-4xl">
                {course.title}
              </h1>
              <p className="mb-4 max-w-2xl text-muted-foreground">{course.description}</p>
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <BookOpen className="h-4 w-4" />
                  {lessonCount} lessons
                </span>
                <span className="flex items-center gap-1.5">
                  <User className="h-4 w-4" />
                  {course.creator?.slice(0, 6)}...{course.creator?.slice(-4)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {account && lessonCount > 0 && (
                <ProgressRing progress={progressPct} />
              )}
              {isOwner && !course.published && (
                <button
                  onClick={handlePublish}
                  disabled={publishing}
                  className="btn-primary-gradient rounded-xl px-5 py-2.5 font-display text-sm font-semibold disabled:opacity-50"
                >
                  {publishing ? "Publishing..." : "Publish Course"}
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Lessons */}
        <div className="max-w-2xl">
          <h2 className="mb-4 font-display text-xl font-bold text-foreground">
            Lessons
          </h2>
          {lessons && lessons.length > 0 ? (
            <div className="space-y-3">
              {lessons.map((lesson: any, idx: number) => (
                <LessonItem
                  key={lesson.id}
                  title={lesson.title}
                  order={idx + 1}
                  completed={completedLessonIds.has(lesson.id)}
                  onClick={() => navigate(`/lesson/${courseId}/${lesson.id}`)}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border bg-muted/30 p-8 text-center text-sm text-muted-foreground">
              No lessons added yet.
              {isOwner && (
                <button
                  onClick={() => navigate(`/create?course=${courseId}`)}
                  className="mt-2 block mx-auto text-primary hover:underline"
                >
                  Add a lesson →
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
