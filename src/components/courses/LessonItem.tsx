import { CheckCircle2, Circle, Lock, Dumbbell } from "lucide-react";
import { motion } from "framer-motion";

interface LessonItemProps {
  title: string;
  order: number;
  completed?: boolean;
  locked?: boolean;
  exerciseCount?: number;
  onClick?: () => void;
}

export function LessonItem({ title, order, completed, locked, exerciseCount, onClick }: LessonItemProps) {
  return (
    <motion.button
      whileHover={!locked ? { x: 4 } : undefined}
      onClick={!locked ? onClick : undefined}
      disabled={locked}
      className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left transition-all ${
        completed
          ? "border-primary/30 bg-primary/5"
          : locked
          ? "cursor-not-allowed border-border bg-muted/50 opacity-60"
          : "border-border bg-card hover:border-primary/40 hover:shadow-card"
      }`}
    >
      <div
        className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full font-display text-sm font-bold ${
          completed
            ? "bg-primary text-primary-foreground"
            : locked
            ? "bg-muted text-muted-foreground"
            : "bg-secondary text-secondary-foreground"
        }`}
      >
        {completed ? (
          <CheckCircle2 className="h-5 w-5" />
        ) : locked ? (
          <Lock className="h-4 w-4" />
        ) : (
          order
        )}
      </div>

      <div className="flex-1 min-w-0">
        <h4 className={`font-medium ${completed ? "text-primary" : "text-card-foreground"}`}>
          {title}
        </h4>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span>{completed ? "Completed" : locked ? "Locked" : "Ready to learn"}</span>
          {exerciseCount != null && exerciseCount > 0 && (
            <span className="flex items-center gap-1">
              <Dumbbell className="h-3 w-3" /> {exerciseCount} exercises
            </span>
          )}
        </div>
      </div>

      {!locked && !completed && (
        <Circle className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
      )}
    </motion.button>
  );
}
