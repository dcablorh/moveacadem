import { useState, useRef } from "react";
import { Upload, FileText, Check, Loader2, Type, Youtube } from "lucide-react";
import { storeBlob, getBlobUrl } from "@/lib/walrus";
import { toast } from "sonner";

interface WalrusUploaderProps {
  label: string;
  onUploaded: (blobUrl: string, blobId: string) => void;
  accept?: string;
  placeholder?: string;
}

function isYoutubeUrl(url: string): boolean {
  return /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/|shorts\/)|youtu\.be\/)/.test(url.trim());
}

export function WalrusUploader({ label, onUploaded, accept, placeholder }: WalrusUploaderProps) {
  const [mode, setMode] = useState<"file" | "text" | "youtube">("file");
  const [uploading, setUploading] = useState(false);
  const [uploadedId, setUploadedId] = useState<string | null>(null);
  const [textContent, setTextContent] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    try {
      const blobId = await storeBlob(file);
      const url = getBlobUrl(blobId);
      setUploadedId(blobId);
      onUploaded(url, blobId);
      toast.success(`Uploaded to Walrus: ${blobId.slice(0, 12)}...`);
    } catch (e: any) {
      toast.error(e.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleTextUpload = async () => {
    if (!textContent.trim()) return;
    setUploading(true);
    try {
      const blobId = await storeBlob(textContent);
      const url = getBlobUrl(blobId);
      setUploadedId(blobId);
      onUploaded(url, blobId);
      toast.success(`Stored to Walrus: ${blobId.slice(0, 12)}...`);
    } catch (e: any) {
      toast.error(e.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleYoutubeSubmit = () => {
    const url = youtubeUrl.trim();
    if (!url) return;
    if (!isYoutubeUrl(url)) {
      toast.error("Please enter a valid YouTube URL");
      return;
    }
    onUploaded(url, `youtube:${url}`);
    setUploadedId(`youtube:${url}`);
    toast.success("YouTube video linked!");
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-foreground">{label}</label>
        <div className="flex gap-1 rounded-lg bg-muted p-0.5">
          <button
            type="button"
            onClick={() => setMode("file")}
            className={`rounded-md px-2 py-1 text-xs font-medium transition-colors ${mode === "file" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}
          >
            <Upload className="mr-1 inline h-3 w-3" /> File
          </button>
          <button
            type="button"
            onClick={() => setMode("text")}
            className={`rounded-md px-2 py-1 text-xs font-medium transition-colors ${mode === "text" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}
          >
            <Type className="mr-1 inline h-3 w-3" /> Text
          </button>
          <button
            type="button"
            onClick={() => setMode("youtube")}
            className={`rounded-md px-2 py-1 text-xs font-medium transition-colors ${mode === "youtube" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}
          >
            <Youtube className="mr-1 inline h-3 w-3" /> YouTube
          </button>
        </div>
      </div>

      {mode === "file" ? (
        <div
          onClick={() => fileRef.current?.click()}
          className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-input bg-card p-4 transition-colors hover:border-primary"
        >
          <input
            ref={fileRef}
            type="file"
            accept={accept}
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
          />
          {uploading ? (
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          ) : uploadedId ? (
            <Check className="h-5 w-5 text-primary" />
          ) : (
            <FileText className="h-5 w-5 text-muted-foreground" />
          )}
          <span className="text-sm text-muted-foreground">
            {uploading ? "Uploading to Walrus..." : uploadedId ? `Stored: ${uploadedId.slice(0, 16)}...` : "Click to upload a file"}
          </span>
        </div>
      ) : mode === "text" ? (
        <div className="space-y-2">
          <textarea
            value={textContent}
            onChange={(e) => setTextContent(e.target.value)}
            placeholder={placeholder || "Enter content (markdown supported)..."}
            rows={6}
            className="w-full resize-none rounded-xl border border-input bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <button
            type="button"
            onClick={handleTextUpload}
            disabled={uploading || !textContent.trim()}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            {uploading ? "Storing..." : "Store to Walrus"}
          </button>
          {uploadedId && (
            <p className="flex items-center gap-1 text-xs text-primary">
              <Check className="h-3 w-3" /> Stored: {uploadedId.slice(0, 20)}...
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center gap-2 rounded-xl border border-input bg-card px-4 py-2.5">
            <Youtube className="h-5 w-5 flex-shrink-0 text-destructive" />
            <input
              type="url"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
          </div>
          <button
            type="button"
            onClick={handleYoutubeSubmit}
            disabled={!youtubeUrl.trim()}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            <Youtube className="h-4 w-4" /> Link Video
          </button>
          {uploadedId?.startsWith("youtube:") && (
            <p className="flex items-center gap-1 text-xs text-primary">
              <Check className="h-3 w-3" /> YouTube video linked
            </p>
          )}
        </div>
      )}
    </div>
  );
}
