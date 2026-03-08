import { Layout } from "@/components/layout/Layout";
import { motion } from "framer-motion";
import { BookOpen, Trophy, Zap, Shield, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useCurrentAccount } from "@mysten/dapp-kit";
import {
  useCourses,
  useStudentProgress,
  useStudentCertificates,
} from "@/hooks/useAcademy";
import { CourseCard } from "@/components/courses/CourseCard";
import { ProgressRing } from "@/components/progress/ProgressRing";

const features = [
  {
    icon: BookOpen,
    title: "Structured Courses",
    description: "Learn Move programming through curated courses with lessons, exercises, and quizzes.",
  },
  {
    icon: Zap,
    title: "Khan-Style Mastery",
    description: "Practice exercises until mastery. Track your progress and level up your skills.",
  },
  {
    icon: Trophy,
    title: "Soulbound Certificates",
    description: "Earn on-chain certificates as NFTs that prove your accomplishments forever.",
  },
  {
    icon: Shield,
    title: "Powered by Sui",
    description: "All progress and certificates are stored immutably on the Sui blockchain.",
  },
];

const Index = () => {
  const account = useCurrentAccount();
  const { data: courses, isLoading } = useCourses();
  const { data: progress } = useStudentProgress();
  const { data: certificates } = useStudentCertificates();

  return (
    <Layout>
      {/* Hero Section */}
      <section className="border-b-2 border-border bg-card">
        <div className="container mx-auto px-4 py-20 md:py-28">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="max-w-3xl"
          >
            <span className="mb-4 inline-block border-2 border-border bg-primary/10 px-4 py-1.5 font-display text-sm font-bold uppercase tracking-wide text-primary shadow-brutal-sm">
              Learn Move on Sui
            </span>
            <h1 className="mb-6 font-display text-4xl font-bold uppercase leading-tight text-foreground md:text-6xl">
              Master Move.{" "}
              <span className="text-primary">Earn On-Chain.</span>
            </h1>
            <p className="mb-8 max-w-xl text-lg text-muted-foreground">
              The decentralized learning platform where you practice until
              mastery, track your progress on-chain, and earn soulbound
              certificate NFTs.
            </p>
            <div className="flex flex-wrap gap-4">
              {progress && progress.length > 0 && courses ? (
                (() => {
                  const lastProgress = progress[progress.length - 1] as any;
                  const activeCourseId = lastProgress?.course_id;
                  const activeCourse = courses.find(
                    (c: any) => c.id === activeCourseId,
                  ) as any;

                  return (
                    <Link
                      to={`/course/${activeCourseId}`}
                      className="btn-primary-gradient inline-flex items-center gap-2 px-6 py-3 text-sm font-bold"
                    >
                      <Zap className="h-4 w-4" />
                      Resume: {activeCourse?.title || "Your Course"}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  );
                })()
              ) : (
                <Link
                  to="/courses"
                  className="btn-primary-gradient inline-flex items-center gap-2 px-6 py-3 text-sm font-bold"
                >
                  Explore Courses
                  <ArrowRight className="h-4 w-4" />
                </Link>
              )}
              {account && (
                <Link
                  to="/create"
                  className="inline-flex items-center gap-2 border-2 border-border bg-card px-6 py-3 font-display text-sm font-bold uppercase text-foreground shadow-brutal-sm transition-all hover:shadow-brutal hover:-translate-x-0.5 hover:-translate-y-0.5"
                >
                  Create a Course
                </Link>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats bar for connected users */}
      {account && (
        <section className="border-b-2 border-border bg-background">
          <div className="container mx-auto flex flex-wrap items-center justify-center gap-8 px-4 py-6 md:gap-16">
            <div className="flex items-center gap-3">
              <ProgressRing
                progress={
                  progress?.length
                    ? Math.min((progress.length / 10) * 100, 100)
                    : 0
                }
                size={56}
                strokeWidth={4}
              />
              <div>
                <p className="font-display text-2xl font-bold text-foreground">
                  {progress?.length || 0}
                </p>
                <p className="text-xs font-bold uppercase text-muted-foreground">
                  Lessons Done
                </p>
              </div>
            </div>
            <div className="text-center">
              <p className="font-display text-2xl font-bold text-foreground">
                {certificates?.length || 0}
              </p>
              <p className="text-xs font-bold uppercase text-muted-foreground">
                Certificates
              </p>
            </div>
            <div className="text-center">
              <p className="font-display text-2xl font-bold text-foreground">
                {courses?.filter((c: any) => c.published).length || 0}
              </p>
              <p className="text-xs font-bold uppercase text-muted-foreground">
                Courses Live
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <h2 className="mb-3 font-display text-3xl font-bold uppercase text-foreground">
            Why Move Academy?
          </h2>
          <p className="text-muted-foreground">
            A new way to learn blockchain development
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="border-2 border-border bg-card p-6 shadow-brutal neo-hover"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center border-2 border-border bg-primary/10">
                <feature.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="mb-2 font-display text-sm font-bold uppercase text-card-foreground">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Recent Courses */}
      <section className="container mx-auto px-4 py-16">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold uppercase text-foreground">
            Recent Courses
          </h2>
          <Link
            to="/courses"
            className="flex items-center gap-1 font-display text-sm font-bold uppercase text-primary hover:underline"
          >
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 animate-pulse border-2 border-border bg-muted" />
            ))}
          </div>
        ) : courses && courses.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {courses
              .filter(
                (c: any) =>
                  c.published || (account && c.creator === account.address),
              )
              .slice(0, 6)
              .map((course: any) => (
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
          <div className="border-2 border-dashed border-border bg-muted/30 p-12 text-center">
            <BookOpen className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 font-display text-lg font-bold uppercase text-foreground">
              No courses yet
            </h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Be the first to create a course on Move Academy!
            </p>
            <Link
              to="/create"
              className="btn-primary-gradient inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold"
            >
              Create Course
            </Link>
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t-2 border-border bg-card py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p className="font-display font-bold uppercase text-foreground">
            Move Academy
          </p>
          <p className="mt-1">
            Decentralized learning on Sui. All progress stored on-chain.
          </p>
        </div>
      </footer>
    </Layout>
  );
};

export default Index;
