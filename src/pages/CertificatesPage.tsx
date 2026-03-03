import { Layout } from "@/components/layout/Layout";
import { useStudentCertificates } from "@/hooks/useAcademy";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { CertificateCard } from "@/components/certificates/CertificateCard";
import { motion } from "framer-motion";
import { Trophy } from "lucide-react";
import { Link } from "react-router-dom";

export default function CertificatesPage() {
  const account = useCurrentAccount();
  const { data: certificates, isLoading } = useStudentCertificates();

  if (!account) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <Trophy className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <h2 className="mb-2 font-display text-2xl font-bold text-foreground">
            Connect Your Wallet
          </h2>
          <p className="text-muted-foreground">
            Connect to view your certificates.
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="mb-2 font-display text-3xl font-bold text-foreground">
            My Certificates
          </h1>
          <p className="mb-8 text-muted-foreground">
            Soulbound NFTs earned by completing courses
          </p>
        </motion.div>

        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2">
            {[1, 2].map((i) => (
              <div key={i} className="h-40 animate-pulse rounded-2xl bg-muted" />
            ))}
          </div>
        ) : certificates && certificates.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2">
            {certificates.map((cert: any) => {
              const certId = typeof cert.id === "string" ? cert.id : String(cert.id);
              return (
                <Link key={certId} to={`/certificate/${certId}`} className="block group">
                  <CertificateCard
                    id={certId}
                    courseTitle={cert.course_title}
                    issuedAt={cert.issued_at}
                    imageUrl={cert.image_url}
                    student={cert.student}
                  />
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border bg-muted/30 p-16 text-center">
            <Trophy className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 font-display text-lg font-semibold text-foreground">
              No certificates yet
            </h3>
            <p className="text-sm text-muted-foreground">
              Complete a course to earn your first soulbound certificate!
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}
