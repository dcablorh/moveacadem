import { motion } from "framer-motion";
import { BookOpen, User, Settings } from "lucide-react";
import { Link } from "react-router-dom";

interface CourseCardProps {
  id: string;
  title: string;
  description: string;
  creator: string;
  lessonCount: number;
  published: boolean;
  isOwner?: boolean;
}

export function CourseCard({ id, title, description, creator, lessonCount, published, isOwner }: CourseCardProps) {
  const truncatedCreator = `${creator.slice(0, 6)}...${creator.slice(-4)}`;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <Link to={`/course/${id}`} className="block">
        <div className="group relative overflow-hidden rounded-xl border border-border bg-card shadow-card transition-shadow hover:shadow-card-hover">
          {/* Color bar */}
          <div className={`h-2 w-full ${published ? "bg-primary" : "bg-accent"}`} />
          
          <div className="p-5">
            <div className="mb-3 flex items-center gap-2">
              {published ? (
                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                  Published
                </span>
              ) : (
                <span className="rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent">
                  Draft
                </span>
              )}
              {isOwner && (
                <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                  <Settings className="mr-0.5 inline h-3 w-3" /> Owner
                </span>
              )}
            </div>

            <h3 className="mb-2 font-display text-lg font-semibold text-card-foreground line-clamp-1 group-hover:text-primary transition-colors">
              {title}
            </h3>
            
            <p className="mb-4 text-sm text-muted-foreground line-clamp-2">
              {description}
            </p>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <BookOpen className="h-3.5 w-3.5" />
                  {lessonCount} lessons
                </span>
                <span className="flex items-center gap-1">
                  <User className="h-3.5 w-3.5" />
                  {truncatedCreator}
                </span>
              </div>
              {isOwner && (
                <span className="text-xs font-medium text-primary">
                  Manage →
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
