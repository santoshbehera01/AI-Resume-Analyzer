import { useEffect, useState } from "react";

interface CircularScoreProps {
  score: number;
  label: string;
  size?: number;
  strokeWidth?: number;
  color?: "primary" | "success" | "warning" | "destructive";
}

const colorClasses = {
  primary: "stroke-primary",
  success: "stroke-success",
  warning: "stroke-warning",
  destructive: "stroke-destructive",
};

const textColorClasses = {
  primary: "text-primary",
  success: "text-success",
  warning: "text-warning",
  destructive: "text-destructive",
};

const CircularScore = ({ score, label, size = 140, strokeWidth = 10, color = "primary" }: CircularScoreProps) => {
  const [animatedScore, setAnimatedScore] = useState(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedScore / 100) * circumference;

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedScore(score), 100);
    return () => clearTimeout(timer);
  }, [score]);

  const resolvedColor = score >= 70 ? "success" : score >= 40 ? "warning" : "destructive";
  const finalColor = color === "primary" ? resolvedColor : color;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            className="stroke-muted"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            className={colorClasses[finalColor]}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 1.5s ease-out" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-3xl font-bold ${textColorClasses[finalColor]}`}>{animatedScore}%</span>
        </div>
      </div>
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
    </div>
  );
};

export default CircularScore;
