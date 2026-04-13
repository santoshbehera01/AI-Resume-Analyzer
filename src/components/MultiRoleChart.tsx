import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import type { MultiRoleResult } from "@/lib/resumeAnalyzer";
import { Briefcase } from "lucide-react";

interface MultiRoleChartProps {
  roles: MultiRoleResult[];
}

const COLORS = [
  "hsl(160, 84%, 39%)",
  "hsl(190, 80%, 45%)",
  "hsl(38, 92%, 50%)",
  "hsl(270, 60%, 55%)",
  "hsl(0, 72%, 51%)",
];

const MultiRoleChart = ({ roles }: MultiRoleChartProps) => (
  <div className="glass-card p-5 space-y-4">
    <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
      <Briefcase className="h-4 w-4 text-primary" />
      Multi-Role Fit Analysis
    </h3>
    <div className="h-[220px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={roles} layout="vertical" margin={{ left: 10, right: 20 }}>
          <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: "hsl(215, 15%, 55%)" }} />
          <YAxis
            type="category"
            dataKey="role"
            width={120}
            tick={{ fontSize: 11, fill: "hsl(210, 20%, 85%)" }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(220, 18%, 10%)",
              border: "1px solid hsl(220, 13%, 18%)",
              borderRadius: "8px",
              fontSize: "12px",
            }}
            formatter={(value: number) => [`${value}%`, "Match"]}
          />
          <Bar dataKey="matchScore" radius={[0, 6, 6, 0]} barSize={20}>
            {roles.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
    <div className="grid grid-cols-1 gap-2">
      {roles.map((r, i) => (
        <div key={r.role} className="flex items-center justify-between text-xs px-2">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
            <span className="text-muted-foreground">{r.role}</span>
          </div>
          <span className="text-foreground font-medium">{r.matchScore}% match</span>
        </div>
      ))}
    </div>
  </div>
);

export default MultiRoleChart;
