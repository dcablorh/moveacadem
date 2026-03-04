import { useQuery } from "@tanstack/react-query";
import { readBlob, AGGREGATOR_URL } from "@/lib/walrus";
import { Loader2, ExternalLink } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { motion } from "framer-motion";

interface WalrusContentProps {
  uri: string;
  className?: string;
  /** When true, tries to render content as Markdown. Default: true */
  markdown?: boolean;
}

/**
 * Renders content from a Walrus blob URI or aggregator URL.
 * Extracts blobId from aggregator URLs, or treats as external link.
 * Renders content as Markdown by default.
 */
export function WalrusContent({
  uri,
  className,
  markdown = true,
}: WalrusContentProps) {
  const blobId = extractBlobId(uri);

  const {
    data: content,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["walrus-blob", blobId],
    enabled: !!blobId,
    queryFn: () => readBlob(blobId!),
    staleTime: 1000 * 60 * 10,
  });

  // If not a walrus URL, show as external link
  if (!blobId) {
    return (
      <a
        href={uri}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 text-primary hover:underline"
      >
        <ExternalLink className="h-4 w-4" /> Open content
      </a>
    );
  }

  if (isLoading) {
    return (
      <div className="w-full space-y-5 py-4">
        {/* Simulates a heading */}
        <motion.div
          initial={{ opacity: 0.5 }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="h-8 w-2/5 rounded-lg bg-muted/60"
        />
        {/* Simulates a video or code block */}
        <motion.div
          initial={{ opacity: 0.5 }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.2,
          }}
          className="h-48 w-full rounded-xl bg-muted/40"
        />
        {/* Simulates paragraphs */}
        <div className="space-y-3">
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.4 }}
            className="h-4 w-full rounded bg-muted/50"
          />
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
            className="h-4 w-[90%] rounded bg-muted/50"
          />
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
            className="h-4 w-[75%] rounded bg-muted/50"
          />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
        Failed to load content from Walrus
      </div>
    );
  }

  if (!content) return null;

  // Determine if content looks like Markdown
  const looksLikeMarkdown =
    /^#{1,6}\s|^\*\*|\*\s|^-\s|^\d+\.\s|```|\[.*\]\(/.test(String(content));
  const shouldRenderMarkdown = markdown && looksLikeMarkdown;

  return (
    <div className={`${className || ""}`}>
      {shouldRenderMarkdown ? (
        <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:font-display prose-headings:text-foreground prose-p:text-foreground/90 prose-code:text-primary prose-code:bg-muted prose-code:rounded prose-pre:bg-muted prose-pre:border prose-pre:border-border prose-a:text-primary">
          <ReactMarkdown>{String(content)}</ReactMarkdown>
        </div>
      ) : (
        <pre className="whitespace-pre-wrap rounded-xl border border-border bg-muted/30 p-4 text-sm text-foreground font-mono">
          {String(content)}
        </pre>
      )}
    </div>
  );
}

function extractBlobId(uri: string): string | null {
  if (!uri) return null;
  // Match aggregator URL pattern
  const prefix = `${AGGREGATOR_URL}/v1/blobs/`;
  if (uri.startsWith(prefix)) {
    return uri.slice(prefix.length);
  }
  // If it looks like a raw blob ID (no slashes, alphanumeric + base64)
  if (/^[A-Za-z0-9_-]{20,}$/.test(uri)) {
    return uri;
  }
  return null;
}
