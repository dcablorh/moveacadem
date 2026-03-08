import { useState } from "react";
import { Plus, Trash2, GripVertical, Check, Loader2, HelpCircle, Lightbulb } from "lucide-react";
import { storeBlob, getBlobUrl } from "@/lib/walrus";
import { toast } from "sonner";

interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
  hint?: string;
}

interface QuizBuilderProps {
  label?: string;
  onUploaded: (blobUrl: string, blobId: string) => void;
}

const emptyQuestion = (): QuizQuestion => ({
  question: "",
  options: ["", ""],
  correct: 0,
  hint: "",
});

export function QuizBuilder({ label = "Quiz Questions", onUploaded }: QuizBuilderProps) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([emptyQuestion()]);
  const [uploading, setUploading] = useState(false);
  const [uploadedId, setUploadedId] = useState<string | null>(null);

  const updateQuestion = (qi: number, patch: Partial<QuizQuestion>) => {
    setQuestions((prev) => prev.map((q, i) => (i === qi ? { ...q, ...patch } : q)));
  };

  const addQuestion = () => {
    setQuestions((prev) => [...prev, emptyQuestion()]);
  };

  const removeQuestion = (qi: number) => {
    if (questions.length <= 1) return;
    setQuestions((prev) => prev.filter((_, i) => i !== qi));
  };

  const addOption = (qi: number) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === qi && q.options.length < 6 ? { ...q, options: [...q.options, ""] } : q))
    );
  };

  const removeOption = (qi: number, oi: number) => {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qi || q.options.length <= 2) return q;
        const newOptions = q.options.filter((_, j) => j !== oi);
        const newCorrect = q.correct === oi ? 0 : q.correct > oi ? q.correct - 1 : q.correct;
        return { ...q, options: newOptions, correct: newCorrect };
      })
    );
  };

  const updateOption = (qi: number, oi: number, value: string) => {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qi) return q;
        const newOptions = [...q.options];
        newOptions[oi] = value;
        return { ...q, options: newOptions };
      })
    );
  };

  const isValid = questions.every(
    (q) => q.question.trim() && q.options.every((o) => o.trim()) && q.options.length >= 2
  );

  const handlePublish = async () => {
    if (!isValid) {
      toast.error("Fill in all questions and options before saving.");
      return;
    }
    setUploading(true);
    try {
      const payload = JSON.stringify({ questions }, null, 2);
      const blobId = await storeBlob(payload);
      const url = getBlobUrl(blobId);
      setUploadedId(blobId);
      onUploaded(url, blobId);
      toast.success(`Quiz stored to Walrus (${questions.length} questions)`);
    } catch (e: any) {
      toast.error(e.message || "Failed to store quiz");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-foreground">{label}</label>

      <div className="space-y-4">
        {questions.map((q, qi) => (
          <div
            key={qi}
            className="rounded-xl border border-input bg-card p-4 space-y-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-primary">
                <HelpCircle className="h-3.5 w-3.5" />
                Question {qi + 1}
              </div>
              {questions.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeQuestion(qi)}
                  className="text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <input
              type="text"
              value={q.question}
              onChange={(e) => updateQuestion(qi, { question: e.target.value })}
              placeholder="Enter your question..."
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />

            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">
                Options — click the radio to mark the correct answer
              </p>
              {q.options.map((opt, oi) => (
                <div key={oi} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name={`quiz-correct-${qi}`}
                    checked={q.correct === oi}
                    onChange={() => updateQuestion(qi, { correct: oi })}
                    className="accent-primary shrink-0"
                    title="Mark as correct answer"
                  />
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => updateOption(qi, oi, e.target.value)}
                    placeholder={`Option ${String.fromCharCode(65 + oi)}`}
                    className={`flex-1 rounded-lg border px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary ${
                      q.correct === oi
                        ? "border-primary/50 bg-primary/5"
                        : "border-input bg-background"
                    }`}
                  />
                  {q.options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeOption(qi, oi)}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  )}
                </div>
              ))}
              {q.options.length < 6 && (
                <button
                  type="button"
                  onClick={() => addOption(qi)}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                >
                  <Plus className="h-3 w-3" /> Add option
                </button>
              )}
            </div>

            <div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                <Lightbulb className="h-3 w-3" /> Hint (optional)
              </div>
              <input
                type="text"
                value={q.hint || ""}
                onChange={(e) => updateQuestion(qi, { hint: e.target.value })}
                placeholder="Optional hint for students..."
                className="w-full rounded-lg border border-input bg-background px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={addQuestion}
          className="flex items-center gap-1.5 rounded-lg border border-dashed border-input px-3 py-2 text-xs font-medium text-muted-foreground hover:border-primary hover:text-primary transition-colors"
        >
          <Plus className="h-3.5 w-3.5" /> Add Question
        </button>

        <span className="text-xs text-muted-foreground">
          {questions.length} question{questions.length !== 1 ? "s" : ""}
        </span>
      </div>

      <button
        type="button"
        onClick={handlePublish}
        disabled={uploading || !isValid}
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
      >
        {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
        {uploading ? "Storing quiz..." : "Save Quiz to Walrus"}
      </button>

      {uploadedId && (
        <p className="flex items-center gap-1 text-xs text-primary">
          <Check className="h-3 w-3" /> Quiz saved ({questions.length} questions)
        </p>
      )}
    </div>
  );
}
