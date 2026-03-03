import { Layout } from "@/components/layout/Layout";
import { useStudentCertificates } from "@/hooks/useAcademy";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Award,
  ExternalLink,
  Copy,
  Share2,
  Lock,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

export default function CertificateDetailPage() {
  const { certId } = useParams<{ certId: string }>();
  const { data: certificates, isLoading } = useStudentCertificates();

  const cert = certificates?.find((c: any) => {
    const id = typeof c.id === "string" ? c.id : String(c.id);
    return id === certId;
  });

  const decodeField = (field: any): string => {
    if (!field) return "";
    if (typeof field === "string") return field;
    if (Array.isArray(field)) return new TextDecoder().decode(new Uint8Array(field));
    return String(field);
  };

  const courseTitle = decodeField(cert?.course_title);
  const imageUrl = decodeField(cert?.image_url);
  const student = cert?.student || "";
  const certObjectId = typeof cert?.id === "string" ? cert.id : String(cert?.id || "");

  // Issued epoch → approximate date
  const issuedEpoch = cert?.issued_at ? Number(cert.issued_at) : null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard!");
  };

  const handleShareTwitter = () => {
    const text = encodeURIComponent(
      `I just earned a certificate for "${courseTitle}" on Move Academy! 🎓 #MoveAcademy #Web3 #Sui`
    );
    const url = encodeURIComponent(window.location.href);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, "_blank");
  };

  const handleShareLinkedIn = () => {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, "_blank");
  };

  const handleVerifyOnChain = () => {
    if (certObjectId) {
      window.open(`https://suiscan.xyz/testnet/object/${certObjectId}`, "_blank");
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto max-w-2xl px-4 py-20 text-center">
          <div className="h-8 w-48 animate-pulse rounded-lg bg-muted mx-auto mb-4" />
          <div className="h-64 w-full animate-pulse rounded-2xl bg-muted" />
        </div>
      </Layout>
    );
  }

  if (!cert) {
    return (
      <Layout>
        <div className="container mx-auto max-w-2xl px-4 py-20 text-center">
          <Award className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <h2 className="mb-2 font-display text-2xl font-bold text-foreground">
            Certificate Not Found
          </h2>
          <p className="mb-6 text-muted-foreground">
            This certificate doesn't exist or you don't have access to it.
          </p>
          <Link
            to="/certificates"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Certificates
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto max-w-2xl px-4 py-10">
        <Link
          to="/certificates"
          className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to My Certificates
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-6"
        >
          {/* Certificate Card */}
          <div className="overflow-hidden rounded-2xl border-2 border-accent/30 bg-card shadow-xl">
            {imageUrl ? (
              <div className="relative h-56 w-full overflow-hidden">
                <img
                  src={imageUrl}
                  alt={`Certificate for ${courseTitle}`}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card/70 to-transparent" />
                <div className="absolute bottom-4 left-5 right-5">
                  <p className="text-xs font-medium uppercase tracking-wider text-white/80">
                    Certificate of Completion
                  </p>
                  <h1 className="font-display text-2xl font-bold text-white">
                    {courseTitle}
                  </h1>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4 bg-gradient-to-r from-accent to-gold-light p-8">
                <Award className="h-14 w-14 text-accent-foreground" />
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-accent-foreground/80">
                    Certificate of Completion
                  </p>
                  <h1 className="font-display text-2xl font-bold text-accent-foreground">
                    {courseTitle}
                  </h1>
                </div>
              </div>
            )}

            {/* Metadata Grid */}
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Student
                  </p>
                  <p className="mt-1 font-mono text-sm text-foreground break-all">
                    {student
                      ? `${student.slice(0, 10)}...${student.slice(-6)}`
                      : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Issued
                  </p>
                  <p className="mt-1 text-sm text-foreground">
                    {issuedEpoch !== null ? `Epoch ${issuedEpoch}` : "—"}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Certificate ID
                  </p>
                  <p className="mt-1 font-mono text-xs text-foreground break-all">
                    {certObjectId || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Type
                  </p>
                  <div className="mt-1 flex items-center gap-1.5 text-sm font-medium text-primary">
                    <Lock className="h-3.5 w-3.5" />
                    Soulbound NFT
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Status
                  </p>
                  <div className="mt-1 flex items-center gap-1.5 text-sm font-medium text-green-600 dark:text-green-400">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Verified
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleShareTwitter}
              className="flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium text-foreground hover:bg-muted transition-colors"
            >
              <Share2 className="h-4 w-4 text-sky-500" />
              Share on X
            </button>
            <button
              onClick={handleShareLinkedIn}
              className="flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium text-foreground hover:bg-muted transition-colors"
            >
              <Share2 className="h-4 w-4 text-blue-600" />
              Share on LinkedIn
            </button>
            <button
              onClick={handleCopyLink}
              className="flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium text-foreground hover:bg-muted transition-colors"
            >
              <Copy className="h-4 w-4 text-muted-foreground" />
              Copy Link
            </button>
            <button
              onClick={handleVerifyOnChain}
              disabled={!certObjectId}
              className="flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              Verify on Chain
            </button>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}
