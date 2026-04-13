import { useState, useCallback } from "react";
import { Upload, FileText, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ResumeUploaderProps {
  onAnalyze: (resumeText: string, jobDescription: string) => void;
  isAnalyzing: boolean;
}

const ResumeUploader = ({ onAnalyze, isAnalyzing }: ResumeUploaderProps) => {
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

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

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  }, [handleFile]);

  const handleSubmit = () => {
    if (!resumeText.trim()) return alert("Please upload or paste your resume");
    if (!jobDescription.trim()) return alert("Please paste a job description");
    onAnalyze(resumeText, jobDescription);
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Resume Upload */}
      <div className="glass-card p-6 space-y-4 animate-slide-up">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          Resume
        </h2>
        
        <div
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
            dragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
          }`}
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          onClick={() => document.getElementById("file-input")?.click()}
        >
          <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Drag & drop your PDF resume or <span className="text-primary font-medium">browse</span>
          </p>
          <input
            id="file-input"
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
        </div>

        {fileName && (
          <div className="flex items-center gap-2 text-sm bg-primary/10 px-3 py-2 rounded-lg">
            <FileText className="h-4 w-4 text-primary" />
            <span className="text-foreground truncate flex-1">{fileName}</span>
            <button onClick={() => { setFileName(null); setResumeText(""); }}>
              <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
            </button>
          </div>
        )}

        <div className="relative">
          <p className="text-xs text-muted-foreground mb-1">Or paste your resume text:</p>
          <Textarea
            placeholder="Paste your resume content here..."
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            className="min-h-[150px] bg-muted/50 border-border/50 text-sm resize-none"
          />
        </div>
      </div>

      {/* Job Description */}
      <div className="glass-card p-6 space-y-4 animate-slide-up" style={{ animationDelay: "0.1s" }}>
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Job Description
        </h2>
        <Textarea
          placeholder="Paste the job description here to compare with your resume..."
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          className="min-h-[300px] bg-muted/50 border-border/50 text-sm resize-none"
        />
        <Button
          onClick={handleSubmit}
          disabled={isAnalyzing || !resumeText.trim() || !jobDescription.trim()}
          className="w-full bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all"
          size="lg"
        >
          {isAnalyzing ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              Analyzing...
            </span>
          ) : (
            "Analyze Resume"
          )}
        </Button>
      </div>
    </div>
  );
};

export default ResumeUploader;
