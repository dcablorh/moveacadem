import { Layout } from "@/components/layout/Layout";
import { useCourses } from "@/hooks/useAcademy";
import { CourseCard } from "@/components/courses/CourseCard";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { useState } from "react";

export default function CoursesPage() {
  const { data: courses, isLoading } = useCourses();
  const [search, setSearch] = useState("");

  const filtered = courses?.filter((c: any) =>
    c.title?.toLowerCase().includes(search.toLowerCase()) ||
    c.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout>
      <div className="container mx-auto px-4 py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="mb-2 font-display text-3xl font-bold text-foreground">
            All Courses
          </h1>
          <p className="mb-8 text-muted-foreground">
            Browse and enroll in courses built by the community
          </p>

          {/* Search */}
          <div className="relative mb-8 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search courses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-input bg-card py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
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
                key={course.id}
                id={course.id}
                title={course.title}
                description={course.description}
                creator={course.creator}
                lessonCount={Number(course.lesson_count)}
                published={course.published}
              />
            ))}
          </div>
        ) : (
          <div className="py-16 text-center text-muted-foreground">
            No courses found.
          </div>
        )}
      </div>
    </Layout>
  );
}
