import { TrendingUp, TrendingDown } from "lucide-react";

interface StrengthAreasProps {
  strongAreas: string[];
  weakAreas: string[];
}

const StrengthAreas = ({ strongAreas, weakAreas }: StrengthAreasProps) => (
  <div className="glass-card p-5 space-y-4">
    <h3 className="text-sm font-semibold text-foreground">Detailed Analysis</h3>
    <div className="space-y-3">
      {strongAreas.map((area, i) => (
        <div key={`s-${i}`} className="flex items-start gap-3 text-sm">
          <TrendingUp className="h-4 w-4 text-success flex-shrink-0 mt-0.5" />
          <span className="text-success/90">{area}</span>
        </div>
      ))}
      {weakAreas.map((area, i) => (
        <div key={`w-${i}`} className="flex items-start gap-3 text-sm">
          <TrendingDown className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
          <span className="text-destructive/90">{area}</span>
        </div>
      ))}
    </div>
  </div>
);

export default StrengthAreas;
