import { CheckCircle, XCircle } from "lucide-react";

interface SkillTagsProps {
  title: string;
  skills: string[];
  variant: "matched" | "missing";
}

const SkillTags = ({ title, skills, variant }: SkillTagsProps) => {
  const isMatched = variant === "matched";
  return (
    <div className="glass-card p-5 space-y-3">
      <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
        {isMatched ? (
          <CheckCircle className="h-4 w-4 text-success" />
        ) : (
          <XCircle className="h-4 w-4 text-destructive" />
        )}
        {title}
        <span className="text-xs text-muted-foreground font-normal">({skills.length})</span>
      </h3>
      <div className="flex flex-wrap gap-2">
        {skills.length === 0 ? (
          <p className="text-xs text-muted-foreground italic">None found</p>
        ) : (
          skills.map((skill) => (
            <span
              key={skill}
              className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all ${
                isMatched
                  ? "bg-success/15 text-success border border-success/20"
                  : "bg-destructive/15 text-destructive border border-destructive/20"
              }`}
            >
              {skill}
            </span>
          ))
        )}
      </div>
    </div>
  );
};

export default SkillTags;
