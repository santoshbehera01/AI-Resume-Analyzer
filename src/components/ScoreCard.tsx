interface ScoreCardProps {
  label: string;
  score: number;
  icon: React.ReactNode;
  color: "primary" | "success" | "warning" | "destructive";
}

const colorMap = {
  primary: { bar: "bg-primary", text: "text-primary", bg: "bg-primary/10" },
  success: { bar: "bg-success", text: "text-success", bg: "bg-success/10" },
  warning: { bar: "bg-warning", text: "text-warning", bg: "bg-warning/10" },
  destructive: { bar: "bg-destructive", text: "text-destructive", bg: "bg-destructive/10" },
};

const ScoreCard = ({ label, score, icon, color }: ScoreCardProps) => {
  const c = colorMap[color];
  return (
    <div className="glass-card p-5 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-lg ${c.bg}`}>{icon}</div>
          <span className="text-sm font-medium text-muted-foreground">{label}</span>
        </div>
        <span className={`text-2xl font-bold ${c.text}`}>{score}%</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${c.bar} transition-all duration-1000 ease-out`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
};

export default ScoreCard;
