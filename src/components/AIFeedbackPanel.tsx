import { Bot, Sparkles, ArrowRight, Zap, AlertTriangle, CheckCircle2, Copy } from "lucide-react";
import type { AIFeedback } from "@/lib/aiFeedback";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface AIFeedbackPanelProps {
  feedback: AIFeedback;
}

const ratingIcon = (rating: string) => {
  if (rating === "strong") return <CheckCircle2 className="h-4 w-4 text-emerald-400" />;
  if (rating === "average") return <AlertTriangle className="h-4 w-4 text-amber-400" />;
  return <AlertTriangle className="h-4 w-4 text-red-400" />;
};

const ratingColor = (rating: string) => {
  if (rating === "strong") return "border-emerald-500/30 bg-emerald-500/5";
  if (rating === "average") return "border-amber-500/30 bg-amber-500/5";
  return "border-red-500/30 bg-red-500/5";
};

const AIFeedbackPanel = ({ feedback }: AIFeedbackPanelProps) => {
  const copyAll = () => {
    const text = [
      "AI Resume Feedback",
      "",
      feedback.overallFeedback,
      "",
      "Key Recommendations:",
      ...feedback.keyRecommendations.map((r, i) => `${i + 1}. ${r}`),
      "",
      "Action Verb Suggestions:",
      ...feedback.actionVerbSuggestions.map((s) => `• ${s}`),
    ].join("\n");
    navigator.clipboard.writeText(text);
    toast.success("Feedback copied to clipboard!");
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          AI Career Coach Feedback
        </h2>
        <Button variant="outline" size="sm" onClick={copyAll} className="gap-2 border-primary/30 text-primary hover:bg-primary/10">
          <Copy className="h-4 w-4" />
          Copy All
        </Button>
      </div>

      {/* Overall */}
      <div className="glass-card p-5 border-l-4 border-l-primary">
        <div className="flex items-start gap-3">
          <Sparkles className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
          <p className="text-sm text-foreground/90 leading-relaxed">{feedback.overallFeedback}</p>
        </div>
      </div>

      {/* Section feedback */}
      {Object.keys(feedback.sectionFeedback || {}).length > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Object.entries(feedback.sectionFeedback).map(([section, data]) => (
            <div key={section} className={`glass-card p-4 space-y-2 border ${ratingColor(data.rating)}`}>
              <div className="flex items-center gap-2">
                {ratingIcon(data.rating)}
                <span className="text-sm font-semibold text-foreground capitalize">{section}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ml-auto ${
                  data.rating === "strong" ? "bg-emerald-500/20 text-emerald-400" :
                  data.rating === "average" ? "bg-amber-500/20 text-amber-400" :
                  "bg-red-500/20 text-red-400"
                }`}>{data.rating}</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{data.feedback}</p>
            </div>
          ))}
        </div>
      )}

      {/* Bullet point improvements */}
      {feedback.bulletPointImprovements?.length > 0 && (
        <div className="glass-card p-5 space-y-3">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Zap className="h-4 w-4 text-amber-400" />
            Bullet Point Improvements
          </h3>
          <div className="space-y-3">
            {feedback.bulletPointImprovements.slice(0, 4).map((bp, i) => (
              <div key={i} className="space-y-1">
                <p className="text-xs text-red-400/80 line-through">{bp.original}</p>
                <div className="flex items-start gap-2">
                  <ArrowRight className="h-3 w-3 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-emerald-400">{bp.improved}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Key Recommendations + Action Verbs */}
      <div className="grid md:grid-cols-2 gap-4">
        {feedback.keyRecommendations?.length > 0 && (
          <div className="glass-card p-5 space-y-3">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              Key Recommendations
            </h3>
            <ol className="space-y-2">
              {feedback.keyRecommendations.map((r, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                  <span className="bg-primary/20 text-primary text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                  {r}
                </li>
              ))}
            </ol>
          </div>
        )}

        {feedback.actionVerbSuggestions?.length > 0 && (
          <div className="glass-card p-5 space-y-3">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              Action Verb Upgrades
            </h3>
            <ul className="space-y-2">
              {feedback.actionVerbSuggestions.map((s, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                  <ArrowRight className="h-3.5 w-3.5 text-primary flex-shrink-0 mt-0.5" />
                  {s}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIFeedbackPanel;
