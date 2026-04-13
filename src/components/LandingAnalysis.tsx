import { useState, useCallback } from "react";
import { Upload, FileText, X, Sparkles, Lock, ArrowRight, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { analyzeResume, type AnalysisResult } from "@/lib/resumeAnalyzer";
import { Link } from "react-router-dom";

interface PreviewData {
  result: AnalysisResult;
  resumeText: string;
}

interface LandingAnalysisProps {
  onPreviewComplete: (data: PreviewData) => void;
}

const LandingAnalysis = ({ onPreviewComplete }: LandingAnalysisProps) => {
  const [resumeText, setResumeText] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStage, setAnalysisStage] = useState("");
  const [previewResult, setPreviewResult] = useState<AnalysisResult | null>(null);

  const extractTextFromPDF = useCallback(async (file: File) => {
    const pdfjsLib = await import("pdfjs-dist");
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let text = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map((item: any) => item.str).join(" ") + "\n";
    }
    return text;
  }, []);

  const handleFile = useCallback(async (file: File) => {
    if (file.type !== "application/pdf") {
      alert("Please upload a PDF file");
      return;
    }
    setFileName(file.name);
    try {
      const text = await extractTextFromPDF(file);
      setResumeText(text);
    } catch {
      alert("Error reading PDF. Please try pasting your resume text instead.");
    }
  }, [extractTextFromPDF]);

  const handleAnalyze = async () => {
    if (!resumeText.trim()) return alert("Please upload or paste your resume");

    setIsAnalyzing(true);
    setPreviewResult(null);

    // Fake loading stages
    const stages = [
      "Scanning your resume...",
      "Analyzing ATS compatibility...",
      "Extracting keywords...",
      "Generating preview..."
    ];

    for (const stage of stages) {
      setAnalysisStage(stage);
      await new Promise(r => setTimeout(r, 800));
    }

    // Use a generic job description for preview analysis
    const genericJD = "We are looking for a skilled software developer with experience in programming languages, web development, databases, and modern development tools. Strong problem-solving skills and ability to work in teams are essential.";

    const result = analyzeResume(resumeText, genericJD);
    setPreviewResult(result);
    onPreviewComplete({ result, resumeText });

    setIsAnalyzing(false);
    setAnalysisStage("");
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  }, [handleFile]);

  if (previewResult) {
    // Show preview results
    const limitedSkills = previewResult.skills.slice(0, 5);
    const limitedSuggestions = previewResult.suggestions.slice(0, 2);

    return (
      <div className="space-y-6">
        {/* Preview Results */}
        <Card className="bg-white/95 backdrop-blur-sm border border-gray-200 shadow-xl">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Sparkles className="h-5 w-5 text-purple-600" />
              Resume Analysis Preview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* ATS Score */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 text-white font-bold text-2xl mb-2">
                {previewResult.score}
              </div>
              <p className="text-sm text-gray-600">ATS Score</p>
            </div>

            {/* Matched Keywords */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Matched Keywords ({limitedSkills.length})</h4>
              <div className="flex flex-wrap gap-2">
                {limitedSkills.map((skill, i) => (
                  <Badge key={i} variant="secondary" className="bg-green-100 text-green-800">
                    {skill}
                  </Badge>
                ))}
                {previewResult.skills.length > 5 && (
                  <Badge variant="outline" className="text-gray-500">
                    +{previewResult.skills.length - 5} more
                  </Badge>
                )}
              </div>
            </div>

            {/* Suggestions */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Quick Suggestions</h4>
              <ul className="space-y-2">
                {limitedSuggestions.map((suggestion, i) => (
                  <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                    <span className="text-purple-600 mt-1">•</span>
                    {suggestion}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Locked Premium Content */}
        <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-dashed border-gray-300 relative overflow-hidden">
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
            <div className="text-center space-y-4 p-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-200 mb-2">
                <Lock className="h-6 w-6 text-gray-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">🔒 Unlock Full Report</h3>
              <p className="text-sm text-gray-600 max-w-md">
                Get complete keyword analysis, missing skills, detailed feedback, and AI career assistant access.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link to="/signup">
                  <Button className="bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:shadow-lg transition-all">
                    <Zap className="h-4 w-4 mr-2" />
                    Get Started Free
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
                    Sign In
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Blurred preview of premium content */}
          <CardContent className="p-6 space-y-4 filter blur-sm opacity-60">
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Missing Skills Analysis</h4>
              <div className="flex flex-wrap gap-2">
                <Badge variant="destructive">React</Badge>
                <Badge variant="destructive">Node.js</Badge>
                <Badge variant="destructive">SQL</Badge>
                <Badge variant="outline">+5 more</Badge>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Section Detection</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  Experience
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  Skills
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                  Projects
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                  Education
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-3">AI Career Coach</h4>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-800">
                  "Your resume shows strong technical skills but could benefit from more quantifiable achievements..."
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <Card className="bg-white/95 backdrop-blur-sm border border-gray-200 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Upload className="h-5 w-5 text-purple-600" />
          Try Resume Analysis
        </CardTitle>
        <p className="text-sm text-gray-600">
          Upload your resume to see a quick ATS score and keyword preview
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload Area */}
        <div
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
            dragActive ? "border-purple-400 bg-purple-50" : "border-gray-300 hover:border-purple-300 hover:bg-gray-50"
          }`}
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          onClick={() => document.getElementById("landing-file-input")?.click()}
        >
          <Upload className="h-10 w-10 mx-auto mb-3 text-gray-400" />
          <p className="text-sm text-gray-600">
            Drag & drop your PDF resume or <span className="text-purple-600 font-medium">browse</span>
          </p>
          <input
            id="landing-file-input"
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
        </div>

        {fileName && (
          <div className="flex items-center gap-2 text-sm bg-purple-50 px-3 py-2 rounded-lg">
            <FileText className="h-4 w-4 text-purple-600" />
            <span className="text-gray-900 truncate flex-1">{fileName}</span>
            <button onClick={() => { setFileName(null); setResumeText(""); }}>
              <X className="h-4 w-4 text-gray-500 hover:text-gray-700" />
            </button>
          </div>
        )}

        {/* Analyze Button */}
        <Button
          onClick={handleAnalyze}
          disabled={isAnalyzing || !resumeText.trim()}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:shadow-lg transition-all"
          size="lg"
        >
          {isAnalyzing ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              {analysisStage}
            </span>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Analyze Resume
            </>
          )}
        </Button>

        {/* Alternative paste option */}
        <div className="relative">
          <p className="text-xs text-gray-500 mb-1">Or paste your resume text:</p>
          <textarea
            placeholder="Paste your resume content here..."
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            className="w-full min-h-[100px] bg-gray-50 border border-gray-200 text-sm resize-none rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default LandingAnalysis;