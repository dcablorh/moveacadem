import { Award, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { getBlobUrl, AGGREGATOR_URL } from "@/lib/walrus";

interface CertificateCardProps {
  courseTitle: string;
  issuedAt: string;
  imageUrl?: string;
  student: string;
}

export function CertificateCard({ courseTitle, issuedAt, imageUrl, student }: CertificateCardProps) {
  const truncatedStudent = `${student.slice(0, 6)}...${student.slice(-4)}`;

  // Decode image URL from bytes if needed
  const decodedImageUrl = (() => {
    if (!imageUrl) return null;
    if (typeof imageUrl === "string") return imageUrl;
    if (Array.isArray(imageUrl)) return new TextDecoder().decode(new Uint8Array(imageUrl as any));
    return null;
  })();

  const isWalrusImage = decodedImageUrl?.includes(AGGREGATOR_URL) || false;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      className="relative overflow-hidden rounded-2xl border-2 border-accent/30 bg-card shadow-card"
    >
      {/* Certificate image or gold gradient header */}
      {decodedImageUrl && isWalrusImage ? (
        <div className="relative h-40 w-full overflow-hidden bg-muted">
          <img src={decodedImageUrl} alt={`Certificate for ${courseTitle}`} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-card/80 to-transparent" />
          <div className="absolute bottom-3 left-4 right-4">
            <p className="text-xs font-medium uppercase tracking-wider text-accent-foreground/80">
              Certificate of Completion
            </p>
            <h3 className="font-display text-lg font-bold text-accent-foreground">
              {courseTitle}
            </h3>
          </div>
        </div>
      ) : (
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
      )}

      <div className="p-5">
        <div className="mb-3 text-xs text-muted-foreground">
          <span className="font-medium text-foreground">Move Academy Certificate</span> — "{courseTitle}"
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Issued to: <span className="font-medium text-foreground">{truncatedStudent}</span>
          </span>
          <span className="text-muted-foreground">
            Epoch: {issuedAt}
          </span>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <span className="flex items-center gap-1 text-xs font-medium text-primary">
            Soulbound NFT
          </span>
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
            Non-transferable
          </span>
        </div>
      </div>
    </motion.div>
  );
}
