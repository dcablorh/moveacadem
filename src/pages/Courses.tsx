import { Layout } from "@/components/layout/Layout";
import { PageBreadcrumb } from "@/components/layout/PageBreadcrumb";
import { useCourses, useOwnerCaps } from "@/hooks/useAcademy";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { CourseCard } from "@/components/courses/CourseCard";
import { motion } from "framer-motion";
import { Search, BookOpen, User, Plus, Settings } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

export default function CoursesPage() {
  const { data: courses, isLoading } = useCourses();
  const { data: caps } = useOwnerCaps();
  const account = useCurrentAccount();
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"all" | "mine">("all");

  const ownedCourseIds = new Set(caps?.map((c: any) => c.course_id) || []);

  // ensure each course id is a string and remove duplicates
  const filtered = courses
    ? Array.from(
        new Map(
          courses.map((c: any) => [String(c.id), { ...c, id: String(c.id) }]),
        ).values(),
      ).filter((c: any) => {
        const matchesSearch =
          c.title?.toLowerCase().includes(search.toLowerCase()) ||
          c.description?.toLowerCase().includes(search.toLowerCase());
        const isOwner = ownedCourseIds.has(c.id);
        const isVisible = c.published || isOwner;
        const matchesTab = tab === "mine" ? isOwner : isVisible;
        return matchesSearch && matchesTab;
      })
    : undefined;

  const myCourseCount =
    courses?.filter((c: any) => ownedCourseIds.has(c.id))?.length || 0;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-10">
        <PageBreadcrumb />
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="mb-1 font-display text-3xl font-bold text-foreground">
                {tab === "mine" ? "My Courses" : "Courses"}
              </h1>
              <p className="text-muted-foreground">
                {tab === "mine"
                  ? "Manage and build your courses"
                  : "Browse community courses or manage your own"}
              </p>
            </div>
            {account && (
              <Link
                to="/create"
                className="btn-primary-gradient inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold"
              >
                <Plus className="h-4 w-4" /> Create New Course
              </Link>
            )}
          </div>

          {/* Tabs */}
          {account && (
            <div className="mb-6 flex gap-1 border-2 border-border bg-muted p-1 max-w-xs">
              <button
                onClick={() => setTab("all")}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-bold uppercase transition-all ${
                  tab === "all"
                    ? "border-2 border-border bg-card text-foreground shadow-brutal-sm"
                    : "border-2 border-transparent text-muted-foreground"
                }`}
              >
                <BookOpen className="h-4 w-4" /> All
              </button>
              <button
                onClick={() => setTab("mine")}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-bold uppercase transition-all ${
                  tab === "mine"
                    ? "border-2 border-border bg-card text-foreground shadow-brutal-sm"
                    : "border-2 border-transparent text-muted-foreground"
                }`}
              >
                <Settings className="h-4 w-4" /> My Courses
                {myCourseCount > 0 && (
                  <span className="border-2 border-border bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
                    {myCourseCount}
                  </span>
                )}
              </button>
            </div>
          )}

          {/* Search */}
          <div className="relative mb-8 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search courses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border-2 border-border bg-card py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none shadow-brutal-sm"
            />
          </div>
        </motion.div>

        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-48 animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
        ) : filtered && filtered.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((course: any) => (
              <CourseCard
                key={String(course.id)}
                id={course.id}
                title={course.title}
                description={course.description}
                creator={course.creator}
                lessonCount={Number(course.lesson_count)}
                published={course.published}
                isOwner={ownedCourseIds.has(course.id)}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border bg-muted/30 p-12 text-center">
            {tab === "mine" ? (
              <>
                <User className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <h3 className="mb-2 font-display text-lg font-semibold text-foreground">
                  No courses created yet
                </h3>
                <p className="mb-4 text-sm text-muted-foreground">
                  Start building your first course on Move Academy!
                </p>
                <Link
                  to="/create"
                  className="btn-primary-gradient inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold"
                >
                  Create Course
                </Link>
              </>
            ) : (
              <p className="text-muted-foreground">No courses found.</p>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
