import { Target, FileText, Hash, Download } from "lucide-react";
import type { AnalysisResult, MultiRoleResult } from "@/lib/resumeAnalyzer";
import { downloadReport } from "@/lib/pdfReport";
import { Button } from "@/components/ui/button";
import CircularScore from "./CircularScore";
import SkillTags from "./SkillTags";
import SuggestionsList from "./SuggestionsList";
import CategoryChart from "./CategoryChart";
import SkillPieChart from "./SkillPieChart";
import StrengthBadge from "./StrengthBadge";
import SectionAnalysis from "./SectionAnalysis";
import StrengthAreas from "./StrengthAreas";
import MultiRoleChart from "./MultiRoleChart";

interface AnalysisResultsProps {
  result: AnalysisResult;
  multiRole: MultiRoleResult[];
}

const AnalysisResults = ({ result, multiRole }: AnalysisResultsProps) => (
  <div className="space-y-6 animate-fade-in">
    <div className="flex items-center justify-between">
      <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
        <Target className="h-5 w-5 text-primary" />
        ATS Analysis Results
      </h2>
      <Button
        variant="outline"
        size="sm"
        onClick={() => downloadReport(result)}
        className="gap-2 border-primary/30 text-primary hover:bg-primary/10"
      >
        <Download className="h-4 w-4" />
        Download PDF Report
      </Button>
    </div>

    {/* Top Scores Row */}
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="glass-card p-5 flex items-center justify-center">
        <CircularScore score={result.score} label="ATS Score" />
      </div>
      <div className="glass-card p-5 flex items-center justify-center">
        <CircularScore score={result.matchScore} label="JD Match" />
      </div>
      <StrengthBadge strength={result.strength} />
      <div className="glass-card p-5 space-y-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <FileText className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{result.resumeWordCount}</p>
            <p className="text-xs text-muted-foreground">Word Count</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Hash className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{result.keywordDensity}%</p>
            <p className="text-xs text-muted-foreground">Keyword Density</p>
          </div>
        </div>
      </div>
    </div>

    {/* Skills */}
    <div className="grid md:grid-cols-2 gap-4">
      <SkillTags title="Matched Keywords" skills={result.skills} variant="matched" />
      <SkillTags title="Missing Keywords" skills={result.missingSkills} variant="missing" />
    </div>

    {/* Section Analysis + Strength Areas */}
    <div className="grid md:grid-cols-2 gap-4">
      <SectionAnalysis found={result.sectionsFound} missing={result.sectionsMissing} />
      <StrengthAreas strongAreas={result.strongAreas} weakAreas={result.weakAreas} />
    </div>

    {/* Charts + Suggestions + Multi-Role */}
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      <CategoryChart categories={result.categories} />
      <SkillPieChart matched={result.skills.length} missing={result.missingSkills.length} />
      <SuggestionsList suggestions={result.suggestions} />
    </div>

    {/* Multi-Role Analysis */}
    <MultiRoleChart roles={multiRole} />
  </div>
);

export default AnalysisResults;
