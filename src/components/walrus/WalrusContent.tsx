import { useQuery } from "@tanstack/react-query";
import { readBlob, AGGREGATOR_URL } from "@/lib/walrus";
import { Loader2, ExternalLink } from "lucide-react";

interface WalrusContentProps {
  uri: string;
  className?: string;
}

/**
 * Renders content from a Walrus blob URI or aggregator URL.
 * Extracts blobId from aggregator URLs, or treats as external link.
 */
export function WalrusContent({ uri, className }: WalrusContentProps) {
  const blobId = extractBlobId(uri);

  const { data: content, isLoading, error } = useQuery({
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
      <div className="flex items-center gap-2 py-4 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading content from Walrus...
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

  return (
    <div className={`prose prose-sm max-w-none dark:prose-invert ${className || ""}`}>
      <pre className="whitespace-pre-wrap rounded-xl border border-border bg-muted/30 p-4 text-sm text-foreground">
        {content}
      </pre>
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
