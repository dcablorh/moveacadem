import { Award, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";

interface CertificateCardProps {
  courseTitle: string;
  issuedAt: string;
  imageUrl?: string;
  student: string;
}

export function CertificateCard({ courseTitle, issuedAt, student }: CertificateCardProps) {
  const truncatedStudent = `${student.slice(0, 6)}...${student.slice(-4)}`;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      className="relative overflow-hidden rounded-2xl border-2 border-accent/30 bg-card shadow-card"
    >
      {/* Gold gradient header */}
      <div className="flex items-center justify-center gap-3 bg-gradient-to-r from-accent to-gold-light p-6">
        <Award className="h-10 w-10 text-accent-foreground" />
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-accent-foreground/80">
            Certificate of Completion
          </p>
          <h3 className="font-display text-lg font-bold text-accent-foreground">
            {courseTitle}
          </h3>
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Issued to: <span className="font-medium text-foreground">{truncatedStudent}</span>
          </span>
          <span className="text-muted-foreground">
            Epoch: {issuedAt}
          </span>
        </div>

        <div className="mt-3 flex items-center gap-1 text-xs text-primary">
          <span className="font-medium">Soulbound NFT</span>
          <ExternalLink className="h-3 w-3" />
        </div>
      </div>
    </motion.div>
  );
}
