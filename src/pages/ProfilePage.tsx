import { Layout } from "@/components/layout/Layout";
import { useStudentProgress, useStudentCertificates, useOwnerCaps } from "@/hooks/useAcademy";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { ProgressRing } from "@/components/progress/ProgressRing";
import { motion } from "framer-motion";
import { BookOpen, Trophy, Star, Copy, Check } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

export default function ProfilePage() {
  const account = useCurrentAccount();
  const { data: progress } = useStudentProgress();
  const { data: certificates } = useStudentCertificates();
  const { data: caps } = useOwnerCaps();
  const [copied, setCopied] = useState(false);

  if (!account) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h2 className="mb-2 font-display text-2xl font-bold text-foreground">Connect Wallet</h2>
          <p className="text-muted-foreground">Connect to view your profile.</p>
        </div>
      </Layout>
    );
  }

  const copyAddress = () => {
    navigator.clipboard.writeText(account.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Layout>
      <div className="container mx-auto max-w-3xl px-4 py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Profile header */}
          <div className="mb-10 flex items-center gap-5">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
              <span className="font-display text-2xl font-bold text-primary">
                {account.address.slice(2, 4).toUpperCase()}
              </span>
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-foreground">My Profile</h1>
              <button
                onClick={copyAddress}
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
              >
                <span className="font-mono">{account.address.slice(0, 8)}...{account.address.slice(-6)}</span>
                {copied ? <Check className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="mb-10 grid grid-cols-3 gap-4">
            <div className="rounded-xl border border-border bg-card p-5 text-center shadow-card">
              <BookOpen className="mx-auto mb-2 h-6 w-6 text-primary" />
              <p className="font-display text-2xl font-bold text-foreground">{progress?.length || 0}</p>
              <p className="text-xs text-muted-foreground">Lessons Done</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-5 text-center shadow-card">
              <Trophy className="mx-auto mb-2 h-6 w-6 text-accent" />
              <p className="font-display text-2xl font-bold text-foreground">{certificates?.length || 0}</p>
              <p className="text-xs text-muted-foreground">Certificates</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-5 text-center shadow-card">
              <Star className="mx-auto mb-2 h-6 w-6 text-gold" />
              <p className="font-display text-2xl font-bold text-foreground">{caps?.length || 0}</p>
              <p className="text-xs text-muted-foreground">Courses Created</p>
            </div>
          </div>

          {/* Quick Links */}
          <div className="mb-10 flex gap-3">
            <Link to="/my-learning" className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90">
              <BookOpen className="h-4 w-4" /> My Learning
            </Link>
            <Link to="/certificates" className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted">
              <Trophy className="h-4 w-4" /> Certificates
            </Link>
          </div>

          {/* Recent Progress */}
          <h2 className="mb-4 font-display text-xl font-bold text-foreground">Recent Progress</h2>
          {progress && progress.length > 0 ? (
            <div className="space-y-3">
              {progress.slice(0, 10).map((p: any) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between rounded-xl border border-border bg-card p-4"
                >
                  <div className="flex items-center gap-3">
                    <ProgressRing progress={Number(p.score)} size={40} strokeWidth={3} />
                    <div>
                      <p className="text-sm font-medium text-card-foreground">
                        Lesson {p.lesson_id?.slice(0, 8)}...
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Score: {p.score} · Epoch: {p.completed_at}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="rounded-xl border border-dashed border-border bg-muted/30 p-8 text-center text-sm text-muted-foreground">
              No progress yet. Start learning!
            </p>
          )}
        </motion.div>
      </div>
    </Layout>
  );
}
