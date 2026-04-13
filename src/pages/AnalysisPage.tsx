import { useState, useEffect } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Search, Trash2, Clock } from "lucide-react";
import { getAnalysisHistory, clearAllAnalyses, type AnalysisHistoryEntry } from "@/lib/analysisStorage";
import { Button } from "@/components/ui/button";

const AnalysisPage = () => {
  const [history, setHistory] = useState<AnalysisHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const loadHistory = async () => {
    setLoading(true);
    const data = await getAnalysisHistory();
    setHistory(data);
    setLoading(false);
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleClear = async () => {
    await clearAllAnalyses();
    setHistory([]);
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center border-b border-border bg-background sticky top-0 z-50 px-4">
            <SidebarTrigger />
          </header>
          <main className="flex-1 p-8 max-w-4xl mx-auto w-full space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Search className="h-5 w-5 text-primary" />
                Analysis History
              </h2>
              {history.length > 0 && (
                <Button variant="outline" size="sm" onClick={handleClear} className="gap-2 text-destructive border-destructive/30 hover:bg-destructive/10">
                  <Trash2 className="h-4 w-4" />
                  Clear
                </Button>
              )}
            </div>

            {loading ? (
              <div className="glass-card p-8 text-center">
                <div className="h-6 w-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
              </div>
            ) : history.length === 0 ? (
              <div className="glass-card p-8 text-center">
                <Clock className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                <p className="text-muted-foreground">No previous analyses yet. Go to Dashboard to run your first analysis.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {history.map((entry) => (
                  <div key={entry.id} className="glass-card p-5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold ${
                        entry.ats_score >= 70 ? "bg-success/15 text-success" :
                        entry.ats_score >= 40 ? "bg-warning/15 text-warning" :
                        "bg-destructive/15 text-destructive"
                      }`}>
                        {entry.ats_score}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground">ATS Score: {entry.ats_score} — {entry.strength}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {new Date(entry.created_at).toLocaleString()} · Match: {entry.match_score}% · Skills: {entry.skills_count} matched, {entry.missing_count} missing
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AnalysisPage;
