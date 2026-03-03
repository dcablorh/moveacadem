import { Layout } from "@/components/layout/Layout";
import { useCourses, useCourseLessons, useOwnerCaps, useStudentProgress } from "@/hooks/useAcademy";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { motion } from "framer-motion";
import { BarChart2, Users, BookOpen, TrendingUp, ArrowLeft, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

function ProgressBar({ value, max, color = "bg-primary" }: { value: number; max: number; color?: string }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
      <div className={`h-full rounded-full ${color} transition-all duration-700`} style={{ width: `${pct}%` }} />
    </div>
  );
}

function CourseAnalyticsCard({ course }: { course: any }) {
  const courseId = typeof course.id === "string" ? course.id : String(course.id);
  const { data: lessons } = useCourseLessons(courseId);
  const { data: allProgress } = useStudentProgress();
  const [expanded, setExpanded] = useState(false);

  const lessonCount = Number(course.lesson_count || 0);

  // Simulated: count how many unique students completed each lesson
  // In reality, you'd query events from chain — using progress data as approximation
  const studentCompletionByLesson = (lessons || []).map((lesson: any, idx: number) => {
    const lessonId = typeof lesson.id === "string" ? lesson.id : String(lesson.id);
    const completions = allProgress?.filter(
      (p: any) => String(p.course_id) === courseId && String(p.lesson_id) === lessonId
    ).length || 0;
    return { lesson, completions, lessonNumber: idx + 1 };
  });

  const maxCompletions = Math.max(...studentCompletionByLesson.map((l) => l.completions), 1);
  const totalCompletions = studentCompletionByLesson.reduce((s, l) => s + l.completions, 0);
  const uniqueStudents = new Set(
    allProgress?.filter((p: any) => String(p.course_id) === courseId).map((p: any) => p.student) || []
  ).size;

  const avgCompletion =
    lessonCount > 0 && uniqueStudents > 0
      ? Math.round((totalCompletions / (lessonCount * uniqueStudents)) * 100)
      : 0;

  return (
    <div className="rounded-2xl border border-border bg-card shadow-card overflow-hidden">
      <div
        className="flex cursor-pointer items-center justify-between p-5 hover:bg-muted/40 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <BookOpen className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-foreground line-clamp-1">
              {course.title}
            </h3>
            <p className="text-xs text-muted-foreground">
              {lessonCount} lessons · {uniqueStudents} students
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-lg font-bold text-foreground">{avgCompletion}%</p>
            <p className="text-xs text-muted-foreground">avg completion</p>
          </div>
          <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${expanded ? "rotate-180" : ""}`} />
        </div>
      </div>

      {expanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="border-t border-border p-5 space-y-3"
        >
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="rounded-xl bg-muted/50 p-3 text-center">
              <p className="text-lg font-bold text-foreground">{uniqueStudents}</p>
              <p className="text-xs text-muted-foreground">Students</p>
            </div>
            <div className="rounded-xl bg-muted/50 p-3 text-center">
              <p className="text-lg font-bold text-foreground">{totalCompletions}</p>
              <p className="text-xs text-muted-foreground">Completions</p>
            </div>
            <div className="rounded-xl bg-muted/50 p-3 text-center">
              <p className="text-lg font-bold text-foreground">{avgCompletion}%</p>
              <p className="text-xs text-muted-foreground">Avg Progress</p>
            </div>
          </div>

          <h4 className="text-sm font-semibold text-foreground">Lesson Completion Rate</h4>
          {studentCompletionByLesson.length > 0 ? (
            <div className="space-y-2.5">
              {studentCompletionByLesson.map(({ lesson, completions, lessonNumber }) => (
                <div key={lessonNumber} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground line-clamp-1">
                      L{lessonNumber}: {lesson.title}
                    </span>
                    <span className="font-medium text-foreground ml-2 shrink-0">
                      {completions} {completions === 1 ? "student" : "students"}
                    </span>
                  </div>
                  <ProgressBar
                    value={completions}
                    max={maxCompletions}
                    color={completions === 0 ? "bg-muted-foreground/30" : "bg-primary"}
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No lesson data yet</p>
          )}

          <div className="pt-2">
            <Link
              to={`/course/${courseId}`}
              className="text-sm font-medium text-primary hover:underline"
            >
              Edit Course →
            </Link>
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default function AnalyticsPage() {
  const account = useCurrentAccount();
  const { data: caps } = useOwnerCaps();
  const { data: courses } = useCourses();

  if (!account) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <BarChart2 className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <h2 className="mb-2 font-display text-2xl font-bold text-foreground">
            Connect Your Wallet
          </h2>
          <p className="text-muted-foreground">Connect to view your course analytics.</p>
        </div>
      </Layout>
    );
  }

  // Only show courses owned by the current wallet
  const ownedCourseIds = new Set(caps?.map((c: any) => String(c.course_id)) || []);
  const ownedCourses = courses?.filter((c: any) => ownedCourseIds.has(String(c.id))) || [];

  return (
    <Layout>
      <div className="container mx-auto max-w-4xl px-4 py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="font-display text-3xl font-bold text-foreground">Analytics</h1>
              <p className="mt-1 text-muted-foreground">Track student engagement across your courses</p>
            </div>
            <Link
              to="/create"
              className="hidden md:inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <BookOpen className="h-4 w-4" /> New Course
            </Link>
          </div>

          {/* Summary stats */}
          {ownedCourses.length > 0 && (
            <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
              {[
                { icon: BookOpen, label: "My Courses", value: ownedCourses.length, color: "text-primary" },
                {
                  icon: BookOpen, label: "Published", color: "text-green-500",
                  value: ownedCourses.filter((c: any) => c.published).length,
                },
                {
                  icon: Users, label: "Total Lessons", color: "text-blue-500",
                  value: ownedCourses.reduce((s: number, c: any) => s + Number(c.lesson_count || 0), 0),
                },
                {
                  icon: TrendingUp, label: "Avg Score", color: "text-accent",
                  value: "—",
                },
              ].map((stat) => (
                <div key={stat.label} className="rounded-xl border border-border bg-card p-4">
                  <stat.icon className={`mb-2 h-5 w-5 ${stat.color}`} />
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          )}

          {ownedCourses.length > 0 ? (
            <div className="space-y-4">
              <h2 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
                <BarChart2 className="h-5 w-5 text-primary" /> Course Breakdown
              </h2>
              {ownedCourses.map((course: any) => (
                <CourseAnalyticsCard key={String(course.id)} course={course} />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border bg-muted/30 p-16 text-center">
              <BarChart2 className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 font-display text-lg font-semibold text-foreground">
                No courses yet
              </h3>
              <p className="mb-6 text-sm text-muted-foreground">
                Create your first course to start seeing analytics.
              </p>
              <Link
                to="/create"
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
              >
                <BookOpen className="h-4 w-4" /> Create Course
              </Link>
            </div>
          )}
        </motion.div>
      </div>
    </Layout>
  );
}
