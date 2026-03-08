import { Award, Eye } from "lucide-react";
import { motion } from "framer-motion";
import { AGGREGATOR_URL } from "@/lib/walrus";

interface CertificateCardProps {
  id?: string;
  courseTitle: string;
  issuedAt: string;
  imageUrl?: string;
  student: string;
}

export function CertificateCard({ id, courseTitle, issuedAt, imageUrl, student }: CertificateCardProps) {
  const truncatedStudent = `${student.slice(0, 6)}...${student.slice(-4)}`;

  const decodedImageUrl = (() => {
    if (!imageUrl) return null;
    if (typeof imageUrl === "string") return imageUrl;
    if (Array.isArray(imageUrl)) return new TextDecoder().decode(new Uint8Array(imageUrl as any));
    return null;
  })();

  const isWalrusImage = decodedImageUrl?.includes(AGGREGATOR_URL) || false;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ x: -2, y: -2 }}
      className="relative overflow-hidden border-2 border-border bg-card shadow-brutal neo-hover"
    >
      {/* Certificate image or accent header */}
      {decodedImageUrl && isWalrusImage ? (
        <div className="relative h-40 w-full overflow-hidden bg-muted">
          <img src={decodedImageUrl} alt={`Certificate for ${courseTitle}`} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-card/60" />
          <div className="absolute bottom-3 left-4 right-4">
            <p className="font-display text-[10px] font-bold uppercase tracking-widest text-foreground">
              Certificate of Completion
            </p>
            <h3 className="font-display text-lg font-bold uppercase text-foreground">
              {courseTitle}
            </h3>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center gap-3 border-b-2 border-border bg-secondary p-6">
          <Award className="h-10 w-10 text-secondary-foreground" />
          <div>
            <p className="font-display text-[10px] font-bold uppercase tracking-widest text-secondary-foreground/70">
              Certificate of Completion
            </p>
            <h3 className="font-display text-lg font-bold uppercase text-secondary-foreground">
              {courseTitle}
            </h3>
          </div>
        </div>
      )}

      <div className="p-5">
        <div className="mb-3 text-xs text-muted-foreground">
          <span className="font-bold text-foreground">Move Academy Certificate</span> — "{courseTitle}"
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Issued to: <span className="font-bold text-foreground">{truncatedStudent}</span>
          </span>
          <span className="text-muted-foreground">
            Epoch: {issuedAt}
          </span>
        </div>

        <div className="mt-3 flex items-center justify-between border-t-2 border-border pt-3">
          <div className="flex items-center gap-2">
            <span className="border-2 border-border bg-primary/10 px-2 py-0.5 font-display text-[10px] font-bold uppercase text-primary">
              Soulbound
            </span>
            <span className="border-2 border-border bg-muted px-2 py-0.5 font-display text-[10px] font-bold uppercase text-muted-foreground">
              Non-transferable
            </span>
          </div>
          {id && (
            <span className="flex items-center gap-1 font-display text-xs font-bold uppercase text-primary">
              <Eye className="h-3.5 w-3.5" /> View
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
