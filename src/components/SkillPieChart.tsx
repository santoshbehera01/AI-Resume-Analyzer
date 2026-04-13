import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface SkillPieChartProps {
  matched: number;
  missing: number;
}

const SkillPieChart = ({ matched, missing }: SkillPieChartProps) => {
  const data = [
    { name: "Matched", value: matched },
    { name: "Missing", value: missing },
  ];
  const COLORS = ["hsl(142, 71%, 45%)", "hsl(0, 72%, 51%)"];

  if (matched === 0 && missing === 0) return null;

  return (
    <div className="glass-card p-5 space-y-3">
      <h3 className="text-sm font-semibold text-foreground">Skill Coverage</h3>
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={4}
              dataKey="value"
              strokeWidth={0}
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(220, 18%, 10%)",
                border: "1px solid hsl(220, 13%, 18%)",
                borderRadius: "8px",
                fontSize: "12px",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex justify-center gap-6 text-xs">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-success" />
          <span className="text-muted-foreground">Matched ({matched})</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-destructive" />
          <span className="text-muted-foreground">Missing ({missing})</span>
        </div>
      </div>
    </div>
  );
};

export default SkillPieChart;
