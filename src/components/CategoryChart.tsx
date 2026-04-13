interface Category {
  name: string;
  score: number;
  maxScore: number;
}

const CategoryChart = ({ categories }: { categories: Category[] }) => (
  <div className="glass-card p-5 space-y-4">
    <h3 className="text-sm font-semibold text-foreground">Skill Categories</h3>
    <div className="space-y-3">
      {categories.map((cat) => {
        const pct = Math.round((cat.score / cat.maxScore) * 100);
        return (
          <div key={cat.name} className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">{cat.name}</span>
              <span className="text-foreground font-medium">{cat.score}/{cat.maxScore}</span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all duration-1000"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

export default CategoryChart;
