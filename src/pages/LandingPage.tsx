import { Link } from "react-router-dom";
import { FileText, Sparkles, Target, BarChart3, Download, Shield, ArrowRight, CheckCircle2, Bot, Zap, Upload, TrendingUp, Search, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import LandingAnalysis from "@/components/LandingAnalysis";
import { type AnalysisResult } from "@/lib/resumeAnalyzer";

interface PreviewData {
  result: AnalysisResult;
  resumeText: string;
}

const features = [
  { icon: Target, title: "ATS Score Analysis", desc: "Get a detailed 0-100 score showing how well your resume passes ATS filters." },
  { icon: BarChart3, title: "Multi-Role Matching", desc: "Compare your resume against multiple job roles simultaneously." },
  { icon: Bot, title: "AI Career Coach", desc: "Get personalized, LLM-powered feedback on every section of your resume." },
  { icon: Shield, title: "Section Detection", desc: "Verify your resume has all critical sections recruiters look for." },
  { icon: Download, title: "PDF Reports", desc: "Download professional analysis reports to track your progress." },
  { icon: CheckCircle2, title: "Smart Keywords", desc: "Dynamic keyword extraction with matched/missing skill highlighting." },
];

const steps = [
  { num: "01", icon: Upload, title: "Upload Resume", desc: "Drop your PDF resume or paste the text directly." },
  { num: "02", icon: Search, title: "AI Analysis", desc: "Our AI scans for ATS compatibility, keywords, and structure." },
  { num: "03", icon: TrendingUp, title: "Get Results", desc: "Receive actionable insights and an ATS-optimized score." },
];

const stats = [
  { value: "50+", label: "ATS Checks" },
  { value: "AI", label: "Career Coach" },
  { value: "5", label: "Role Fits" },
  { value: "PDF", label: "Reports" },
];

export default function LandingPage() {
  const { user } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [previewResult, setPreviewResult] = useState<AnalysisResult | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handlePreviewComplete = (data: PreviewData) => {
    setPreviewResult(data.result);
    // Store preview data for later use after login
    localStorage.setItem("ats-preview-data", JSON.stringify(data));
  };

  return (
    <div className="min-h-screen bg-[#fafbff]" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Navbar */}
      <nav
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/90 backdrop-blur-xl shadow-[0_1px_3px_rgba(0,0,0,0.08)]"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] shadow-md shadow-[#6366f1]/20">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-lg text-[#1e1b4b]">AI Resume Analyzer</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            {user ? (
              <Link to="/dashboard">
                <Button className="rounded-full bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white shadow-md shadow-[#6366f1]/25 hover:shadow-lg hover:shadow-[#6366f1]/30 transition-all duration-200 hover:scale-105 px-5 h-9 text-sm font-medium">
                  Dashboard <ArrowRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" className="text-[#4b5563] hover:text-[#1e1b4b] font-medium text-sm h-9 rounded-full px-4">
                    Sign in
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button className="rounded-full bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white shadow-md shadow-[#6366f1]/25 hover:shadow-lg hover:shadow-[#6366f1]/30 transition-all duration-200 hover:scale-105 px-5 h-9 text-sm font-medium">
                    Get Started <ArrowRight className="h-3.5 w-3.5 ml-1" />
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-16 pb-20 md:pt-24 md:pb-32 px-4 sm:px-6 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#eef2ff] via-[#fafbff] to-white pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[radial-gradient(ellipse,#c7d2fe_0%,transparent_70%)] opacity-40 pointer-events-none" />

        <div className="max-w-6xl mx-auto relative">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left: Text */}
            <div className="space-y-6 text-center lg:text-left animate-fade-in">
              <div className="inline-flex items-center gap-2 bg-[#eef2ff] border border-[#c7d2fe] rounded-full px-4 py-1.5 text-sm text-[#6366f1] font-medium">
                <Sparkles className="h-3.5 w-3.5" />
                AI-Powered Resume Analysis
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-[3.5rem] font-extrabold text-[#1e1b4b] leading-[1.1] tracking-tight">
                Improve your resume with{" "}
                <span className="bg-gradient-to-r from-[#6366f1] to-[#a855f7] bg-clip-text text-transparent">
                  AI-powered insights
                </span>
              </h1>

              <p className="text-lg text-[#6b7280] max-w-lg mx-auto lg:mx-0 leading-relaxed">
                Analyze your resume, match job descriptions, and get ATS-optimized feedback instantly — powered by advanced AI.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start pt-2">
                <Link to={user ? "/dashboard" : "/signup"}>
                  <Button className="rounded-full bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white shadow-lg shadow-[#6366f1]/25 hover:shadow-xl hover:shadow-[#6366f1]/30 transition-all duration-200 hover:scale-105 px-8 h-12 text-base font-semibold">
                    <Zap className="h-4 w-4 mr-2" />
                    {user ? "Go to Dashboard" : "Start for free →"}
                  </Button>
                </Link>
                {!user && (
                  <Link to="/login">
                    <Button variant="outline" className="rounded-full border-[#d1d5db] text-[#4b5563] hover:bg-[#f3f4f6] hover:border-[#9ca3af] transition-all duration-200 px-8 h-12 text-base font-medium">
                      Sign in
                    </Button>
                  </Link>
                )}
              </div>

              <div className="grid grid-cols-4 gap-4 max-w-sm mx-auto lg:mx-0 pt-6">
                {stats.map((s) => (
                  <div key={s.label} className="text-center">
                    <p className="text-xl font-bold bg-gradient-to-r from-[#6366f1] to-[#a855f7] bg-clip-text text-transparent">{s.value}</p>
                    <p className="text-[11px] text-[#9ca3af] mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Analysis Component */}
            <div className="relative animate-fade-in" style={{ animationDelay: "0.15s" }}>
              <LandingAnalysis onPreviewComplete={handlePreviewComplete} />
              {/* Decorative glow */}
              <div className="absolute -z-10 inset-0 bg-gradient-to-r from-[#6366f1]/10 to-[#a855f7]/10 rounded-2xl blur-2xl scale-105" />
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 md:py-28 px-4 sm:px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-[#6366f1] tracking-wide uppercase mb-2">How it works</p>
            <h2 className="text-3xl md:text-4xl font-bold text-[#1e1b4b]">Three simple steps to a better resume</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <div key={step.num} className="relative text-center group animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center mb-4 shadow-lg shadow-[#6366f1]/20 group-hover:scale-110 transition-transform duration-200">
                  <step.icon className="h-6 w-6 text-white" />
                </div>
                <p className="text-xs font-bold text-[#6366f1] mb-1">STEP {step.num}</p>
                <h3 className="text-lg font-semibold text-[#1e1b4b] mb-2">{step.title}</h3>
                <p className="text-sm text-[#6b7280] leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 md:py-28 px-4 sm:px-6 bg-[#fafbff]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-[#6366f1] tracking-wide uppercase mb-2">Features</p>
            <h2 className="text-3xl md:text-4xl font-bold text-[#1e1b4b] mb-4">Everything you need to beat the ATS</h2>
            <p className="text-[#6b7280] max-w-xl mx-auto">Professional-grade tools plus AI intelligence to optimize your resume.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <div
                key={f.title}
                className="bg-white border border-[#e5e7eb] rounded-xl p-6 space-y-3 hover:shadow-lg hover:shadow-[#6366f1]/5 hover:-translate-y-1 transition-all duration-200 animate-fade-in"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div className="p-2.5 rounded-lg bg-[#eef2ff] w-fit">
                  <f.icon className="h-5 w-5 text-[#6366f1]" />
                </div>
                <h3 className="font-semibold text-[#1e1b4b]">{f.title}</h3>
                <p className="text-sm text-[#6b7280] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28 px-4 sm:px-6 bg-white">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center mb-2 shadow-lg shadow-[#6366f1]/20">
            <Award className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-[#1e1b4b]">Ready to improve your resume?</h2>
          <p className="text-[#6b7280] text-lg">Get instant ATS scoring and AI-powered career coaching — completely free.</p>
          <Link to={user ? "/dashboard" : "/signup"}>
            <Button className="rounded-full bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white shadow-lg shadow-[#6366f1]/25 hover:shadow-xl hover:shadow-[#6366f1]/30 transition-all duration-200 hover:scale-105 px-8 h-12 text-base font-semibold mt-2">
              Get Started Free <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#e5e7eb] py-8 px-4 bg-[#fafbff]">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-xs text-[#9ca3af]">
            AI Resume Analyzer — Production-grade SaaS portfolio project
          </p>
        </div>
      </footer>
    </div>
  );
}
