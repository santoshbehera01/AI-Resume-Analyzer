import { useState, useEffect } from "react";
import ResumeUploader from "@/components/ResumeUploader";
import AnalysisResults from "@/components/AnalysisResults";
import AIFeedbackPanel from "@/components/AIFeedbackPanel";
import { analyzeResume, analyzeMultiRole, type AnalysisResult, type MultiRoleResult } from "@/lib/resumeAnalyzer";
import { getAIFeedback, type AIFeedback } from "@/lib/aiFeedback";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Sparkles, Bot, Upload } from "lucide-react";
import { toast } from "sonner";
import { usePreviewData } from "@/hooks/usePreviewData";

interface PreviewData {
  result: AnalysisResult;
  resumeText: string;
}

const Index = () => {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [multiRole, setMultiRole] = useState<MultiRoleResult[]>([]);
  const [aiFeedback, setAiFeedback] = useState<AIFeedback | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStage, setAnalysisStage] = useState("");
  const { previewData, clearPreviewData } = usePreviewData();

  // Auto-analyze preview data on mount
  useEffect(() => {
    if (previewData && !result) {
      handlePreviewAnalysis(previewData);
    }
  }, [previewData]);

  const handlePreviewAnalysis = async (previewData: PreviewData) => {
    setIsAnalyzing(true);
    setAiFeedback(null);

    // Use the stored resume text to run full analysis
    const resumeText = previewData.resumeText;
    const genericJD = "We are looking for a skilled software developer with experience in programming languages, web development, databases, and modern development tools. Strong problem-solving skills and ability to work in teams are essential.";

    // Re-run analysis with stored resume text
    const analysis = analyzeResume(resumeText, genericJD);
    const roles = analyzeMultiRole(resumeText);
    setResult(analysis);
    setMultiRole(roles);

    setAnalysisStage("Generating AI career coach feedback…");
    try {
      const feedback = await getAIFeedback(resumeText, genericJD);
      setAiFeedback(feedback);
      toast.success("Full analysis complete!");
    } catch (err: any) {
      console.error("AI feedback failed:", err);
      toast.error("AI feedback unavailable. ATS analysis is still shown.");
    }

    setIsAnalyzing(false);
    setAnalysisStage("");
    clearPreviewData(); // Clear after use
  };

  const handleAnalyze = async (resumeText: string, jobDescription: string) => {
    setIsAnalyzing(true);
    setAiFeedback(null);

    try {
      localStorage.setItem("ats-last-resume", resumeText);
      localStorage.setItem("ats-last-jd", jobDescription);
    } catch {}

    setAnalysisStage("Running ATS scan…");
    await new Promise((r) => setTimeout(r, 800));
    const analysis = analyzeResume(resumeText, jobDescription);
    const roles = analyzeMultiRole(resumeText);
    setResult(analysis);
    setMultiRole(roles);

    setAnalysisStage("Generating AI career coach feedback…");
    try {
      const feedback = await getAIFeedback(resumeText, jobDescription);
      setAiFeedback(feedback);
      toast.success("AI analysis complete!");
    } catch (err: any) {
      console.error("AI feedback failed:", err);
      toast.error("AI feedback unavailable. ATS analysis is still shown.");
    }

    setIsAnalyzing(false);
    setAnalysisStage("");
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center border-b border-border bg-background sticky top-0 z-50 px-4 gap-3">
            <SidebarTrigger />
            <div className="flex items-center gap-2 ml-auto text-sm text-muted-foreground">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="hidden sm:inline">ATS Simulator</span>
            </div>
          </header>

          <main className="flex-1 p-4 md:p-8 space-y-8 max-w-6xl mx-auto w-full">
            <div className="text-center space-y-3 py-6">
              <h2 className="text-3xl md:text-4xl font-bold gradient-text">
                AI Resume Analyzer
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto text-sm leading-relaxed">
                Upload your resume and paste a job description to get an ATS-powered analysis with AI career coaching.
              </p>
            </div>

            <ResumeUploader onAnalyze={handleAnalyze} isAnalyzing={isAnalyzing} />

            {isAnalyzing && (
              <div className="glass-card p-10 flex flex-col items-center gap-5 animate-fade-in">
                <div className="relative">
                  <div className="h-14 w-14 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                  <Bot className="h-6 w-6 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </div>
                <p className="text-sm text-muted-foreground animate-pulse">{analysisStage}</p>
              </div>
            )}

            {!result && !isAnalyzing && (
              <div className="glass-card p-12 flex flex-col items-center gap-4 text-center">
                <div className="p-4 rounded-2xl bg-primary/5">
                  <Upload className="h-8 w-8 text-muted-foreground/40" />
                </div>
                <p className="text-muted-foreground text-sm">Upload your resume to begin analysis</p>
                <p className="text-muted-foreground/50 text-xs">PDF format supported · Paste text manually as an alternative</p>
              </div>
            )}

            {result && !isAnalyzing && <AnalysisResults result={result} multiRole={multiRole} />}
            {aiFeedback && !isAnalyzing && <AIFeedbackPanel feedback={aiFeedback} />}

            <footer className="text-center py-8 border-t border-border/30">
              <p className="text-[11px] text-muted-foreground/50">
                AI Resume Analyzer + ATS Simulator — Production-grade portfolio project
              </p>
            </footer>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Index;
