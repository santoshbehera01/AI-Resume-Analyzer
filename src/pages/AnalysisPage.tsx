import { useState, useEffect, useMemo } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Search, Trash2, Clock, FileText, Download, Eye, BarChart3, TrendingUp, Award, Filter } from "lucide-react";
import { getAnalysisHistory, clearAllAnalyses, deleteAnalysis, type AnalysisHistoryEntry } from "@/lib/analysisStorage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const AnalysisPage = () => {
  const [history, setHistory] = useState<AnalysisHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [scoreFilter, setScoreFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const navigate = useNavigate();

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
    toast.success("All analyses cleared");
  };

  const handleDelete = async (id: string) => {
    await deleteAnalysis(id);
    setHistory(history.filter(h => h.id !== id));
    toast.success("Analysis deleted");
  };

  // Analytics
  const totalAnalyses = history.length;
  const averageScore = totalAnalyses > 0 ? Math.round(history.reduce((acc, curr) => acc + curr.ats_score, 0) / totalAnalyses) : 0;
  const highestScore = totalAnalyses > 0 ? Math.max(...history.map(h => h.ats_score)) : 0;

  // Filtering & Sorting
  const filteredAndSortedHistory = useMemo(() => {
    let result = [...history];

    if (searchQuery) {
      result = result.filter(item => 
        item.strength.toLowerCase().includes(searchQuery.toLowerCase()) ||
        "Resume Analysis".toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (scoreFilter === "high") result = result.filter(item => item.ats_score >= 80);
    else if (scoreFilter === "medium") result = result.filter(item => item.ats_score >= 50 && item.ats_score < 80);
    else if (scoreFilter === "low") result = result.filter(item => item.ats_score < 50);

    result.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      if (sortBy === "newest") return dateB - dateA;
      if (sortBy === "oldest") return dateA - dateB;
      if (sortBy === "highest") return b.ats_score - a.ats_score;
      if (sortBy === "lowest") return a.ats_score - b.ats_score;
      return 0;
    });

    return result;
  }, [history, searchQuery, scoreFilter, sortBy]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
    if (score >= 50) return "text-amber-500 bg-amber-500/10 border-amber-500/20";
    return "text-red-500 bg-red-500/10 border-red-500/20";
  };
  
  const getProgressColor = (score: number) => {
    if (score >= 80) return "bg-emerald-500";
    if (score >= 50) return "bg-amber-500";
    return "bg-red-500";
  };

  const loadDummyData = () => {
    const dummy: AnalysisHistoryEntry[] = [
      { id: "mock-1", ats_score: 92, match_score: 85, strength: "Excellent", skills_count: 15, missing_count: 2, created_at: new Date().toISOString() },
      { id: "mock-2", ats_score: 65, match_score: 55, strength: "Average", skills_count: 8, missing_count: 6, created_at: new Date(Date.now() - 86400000).toISOString() },
      { id: "mock-3", ats_score: 42, match_score: 30, strength: "Needs Work", skills_count: 5, missing_count: 12, created_at: new Date(Date.now() - 172800000).toISOString() },
    ];
    setHistory(dummy);
    toast.success("Mock data loaded for demonstration");
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background/95">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center border-b border-border bg-background/50 backdrop-blur-md sticky top-0 z-50 px-4 gap-3">
            <SidebarTrigger />
            <div className="flex items-center gap-2 ml-auto text-sm text-muted-foreground">
              <span className="hidden sm:inline">History</span>
            </div>
          </header>
          
          <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
                  Analysis History
                </h2>
                <p className="text-muted-foreground mt-1 text-sm">Review and track your resume performance over time.</p>
              </div>
              {history.length > 0 && (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleClear} className="text-destructive border-destructive/30 hover:bg-destructive/10">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear All
                  </Button>
                </div>
              )}
            </div>

            {/* Top Summary Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="shadow-sm border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-medium">Total Analyses</CardTitle>
                  <div className="p-2 bg-primary/10 rounded-md">
                    <BarChart3 className="h-4 w-4 text-primary" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{totalAnalyses}</div>
                  <p className="text-xs text-muted-foreground mt-1">Resumes processed</p>
                </CardContent>
              </Card>
              <Card className="shadow-sm border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-medium">Average ATS Score</CardTitle>
                  <div className="p-2 bg-blue-500/10 rounded-md">
                    <TrendingUp className="h-4 w-4 text-blue-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{averageScore}%</div>
                  <p className="text-xs text-muted-foreground mt-1">Across all analyses</p>
                </CardContent>
              </Card>
              <Card className="shadow-sm border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-medium">Highest Score</CardTitle>
                  <div className="p-2 bg-amber-500/10 rounded-md">
                    <Award className="h-4 w-4 text-amber-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{highestScore}%</div>
                  <p className="text-xs text-muted-foreground mt-1">Best performing resume</p>
                </CardContent>
              </Card>
            </div>

            {/* Search & Filter Bar */}
            {history.length > 0 && (
              <div className="flex flex-col sm:flex-row gap-4 items-center bg-card/50 backdrop-blur-sm border border-border/50 p-3 rounded-xl shadow-sm">
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search by resume name or strength..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 bg-transparent border-none shadow-none focus-visible:ring-0"
                  />
                </div>
                <div className="h-6 w-px bg-border hidden sm:block"></div>
                <div className="flex gap-3 w-full sm:w-auto">
                  <Select value={scoreFilter} onValueChange={setScoreFilter}>
                    <SelectTrigger className="w-full sm:w-[140px] border-none bg-transparent shadow-none focus:ring-0 gap-2">
                      <Filter className="h-4 w-4 text-muted-foreground" />
                      <SelectValue placeholder="Score" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Scores</SelectItem>
                      <SelectItem value="high">High (&gt;80)</SelectItem>
                      <SelectItem value="medium">Medium (50-80)</SelectItem>
                      <SelectItem value="low">Low (&lt;50)</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-full sm:w-[140px] border-none bg-transparent shadow-none focus:ring-0">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="oldest">Oldest First</SelectItem>
                      <SelectItem value="highest">Highest Score</SelectItem>
                      <SelectItem value="lowest">Lowest Score</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Main Section */}
            {loading ? (
              <div className="py-20 flex justify-center">
                <div className="h-8 w-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
              </div>
            ) : history.length === 0 ? (
              <Card className="flex flex-col items-center justify-center py-20 text-center border-dashed border-2 shadow-none bg-card/30">
                <div className="h-24 w-24 bg-primary/5 rounded-full flex items-center justify-center mb-6">
                  <FileText className="h-12 w-12 text-primary/40" />
                </div>
                <CardTitle className="text-2xl mb-3">No analyses yet</CardTitle>
                <CardDescription className="max-w-md mb-8 text-base">
                  Start by analyzing your resume against a job description to get detailed ATS insights.
                </CardDescription>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button size="lg" onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>
                  <Button size="lg" variant="outline" onClick={loadDummyData}>Load Demo Data</Button>
                </div>
              </Card>
            ) : filteredAndSortedHistory.length === 0 ? (
              <div className="py-20 text-center text-muted-foreground">
                <Search className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p className="text-lg mb-2">No analyses match your filters.</p>
                <Button variant="link" onClick={() => { setSearchQuery(""); setScoreFilter("all"); }}>Clear filters</Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredAndSortedHistory.map((entry) => (
                  <Card key={entry.id} className="group overflow-hidden border-border/50 shadow-sm hover:shadow-md transition-all duration-300 hover:border-primary/30 bg-card/50 backdrop-blur-sm flex flex-col">
                    <CardHeader className="p-5 pb-4 flex flex-row items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-xl border ${getScoreColor(entry.ats_score)}`}>
                          <FileText className="h-5 w-5" />
                        </div>
                        <div>
                          <CardTitle className="text-lg font-semibold group-hover:text-primary transition-colors line-clamp-1">Resume Analysis</CardTitle>
                          <CardDescription className="flex items-center gap-2 mt-1">
                            <Clock className="h-3 w-3" />
                            {new Date(entry.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge variant="outline" className={`${getScoreColor(entry.ats_score)} font-bold text-sm px-2.5 py-0.5 border-opacity-50`}>
                        {entry.ats_score}%
                      </Badge>
                    </CardHeader>
                    <CardContent className="p-5 pt-0 flex-1">
                      <div className="space-y-5">
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground font-medium">ATS Match Score</span>
                            <span className="font-semibold">{entry.match_score}%</span>
                          </div>
                          <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${getProgressColor(entry.match_score)} transition-all duration-1000 ease-out`} 
                              style={{ width: `${entry.match_score}%` }} 
                            />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-3 text-sm bg-muted/30 p-3 rounded-xl border border-border/40">
                          <div className="text-center">
                            <p className="text-muted-foreground text-[10px] uppercase tracking-wider mb-1 font-semibold">Status</p>
                            <p className={`font-medium capitalize truncate ${getScoreColor(entry.ats_score).split(' ')[0]}`}>
                              {entry.strength.toLowerCase()}
                            </p>
                          </div>
                          <div className="text-center border-l border-border/50">
                            <p className="text-muted-foreground text-[10px] uppercase tracking-wider mb-1 font-semibold">Skills</p>
                            <p className="font-medium">{entry.skills_count}</p>
                          </div>
                          <div className="text-center border-l border-border/50">
                            <p className="text-muted-foreground text-[10px] uppercase tracking-wider mb-1 font-semibold">Missing</p>
                            <p className="font-medium text-destructive">{entry.missing_count}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="p-4 flex gap-2 justify-end border-t border-border/50 bg-muted/5 transition-colors">
                      <Button variant="ghost" size="sm" className="h-8 text-muted-foreground hover:text-primary">
                        <Eye className="h-4 w-4 mr-1.5" />
                        Details
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 text-muted-foreground hover:text-blue-500">
                        <Download className="h-4 w-4 mr-1.5" />
                        Report
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleDelete(entry.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </CardFooter>
                  </Card>
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
