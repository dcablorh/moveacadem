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
      whileHover={{ x: -2, y: -2 }}
      transition={{ type: "tween", duration: 0.1 }}
    >
      <Link to={`/course/${id}`} className="block">
        <div className="group relative overflow-hidden border-2 border-border bg-card shadow-brutal neo-hover">
          {/* Color bar */}
          <div className={`h-3 w-full ${published ? "bg-primary" : "bg-secondary"}`} />
          
          <div className="p-5">
            <div className="mb-3 flex items-center gap-2">
              {published ? (
                <span className="border-2 border-border bg-primary/10 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-primary">
                  Live
                </span>
              ) : (
                <span className="border-2 border-border bg-secondary/30 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-secondary-foreground">
                  Draft
                </span>
              )}
              {isOwner && (
                <span className="border-2 border-border bg-muted px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  <Settings className="mr-0.5 inline h-3 w-3" /> Owner
                </span>
              )}
            </div>

            <h3 className="mb-2 font-display text-lg font-bold uppercase text-card-foreground">
              {title}
            </h3>
            
            <p className="mb-4 text-sm text-muted-foreground line-clamp-2">
              {description}
            </p>

            <div className="flex items-center justify-between border-t-2 border-border pt-3">
              <div className="flex items-center gap-4 text-xs font-bold text-muted-foreground">
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
                <span className="text-xs font-bold uppercase text-primary">
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
