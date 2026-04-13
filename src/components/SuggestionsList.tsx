import { Lightbulb } from "lucide-react";

interface SuggestionsListProps {
  suggestions: string[];
}

const SuggestionsList = ({ suggestions }: SuggestionsListProps) => (
  <div className="glass-card p-5 space-y-3">
    <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
      <Lightbulb className="h-4 w-4 text-warning" />
      Suggestions for Improvement
    </h3>
    <ul className="space-y-2">
      {suggestions.map((s, i) => (
        <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
          <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
          {s}
        </li>
      ))}
    </ul>
  </div>
);

export default SuggestionsList;
