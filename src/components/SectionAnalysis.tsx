import { CheckCircle2, XCircle, LayoutList } from "lucide-react";

interface SectionAnalysisProps {
  found: string[];
  missing: string[];
}

const SectionAnalysis = ({ found, missing }: SectionAnalysisProps) => (
  <div className="glass-card p-5 space-y-4">
    <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
      <LayoutList className="h-4 w-4 text-primary" />
      Resume Sections
    </h3>
    <div className="grid grid-cols-2 gap-3">
      <div className="space-y-2">
        <p className="text-xs font-medium text-success">✅ Found</p>
        {found.length === 0 ? (
          <p className="text-xs text-muted-foreground italic">None detected</p>
        ) : (
          found.map((s) => (
            <div key={s} className="flex items-center gap-2 text-xs text-foreground">
              <CheckCircle2 className="h-3.5 w-3.5 text-success flex-shrink-0" />
              {s}
            </div>
          ))
        )}
      </div>
      <div className="space-y-2">
        <p className="text-xs font-medium text-destructive">❌ Missing</p>
        {missing.length === 0 ? (
          <p className="text-xs text-muted-foreground italic">All found!</p>
        ) : (
          missing.map((s) => (
            <div key={s} className="flex items-center gap-2 text-xs text-foreground">
              <XCircle className="h-3.5 w-3.5 text-destructive flex-shrink-0" />
              {s}
            </div>
          ))
        )}
      </div>
    </div>
  </div>
);

export default SectionAnalysis;
