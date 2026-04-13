import { Shield, AlertTriangle, Rocket } from "lucide-react";

interface StrengthBadgeProps {
  strength: "Weak" | "Average" | "Strong";
}

const config = {
  Weak: {
    icon: AlertTriangle,
    emoji: "⚠️",
    bg: "bg-destructive/15 border-destructive/30",
    text: "text-destructive",
    label: "Weak Resume",
  },
  Average: {
    icon: Shield,
    emoji: "👍",
    bg: "bg-warning/15 border-warning/30",
    text: "text-warning",
    label: "Average Resume",
  },
  Strong: {
    icon: Rocket,
    emoji: "🚀",
    bg: "bg-success/15 border-success/30",
    text: "text-success",
    label: "Strong Resume",
  },
};

const StrengthBadge = ({ strength }: StrengthBadgeProps) => {
  const c = config[strength];
  const Icon = c.icon;

  return (
    <div className={`glass-card p-5 flex items-center gap-4 border ${c.bg}`}>
      <div className={`p-3 rounded-xl ${c.bg}`}>
        <Icon className={`h-6 w-6 ${c.text}`} />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">Resume Strength</p>
        <p className={`text-xl font-bold ${c.text}`}>
          {c.emoji} {c.label}
        </p>
      </div>
    </div>
  );
};

export default StrengthBadge;
