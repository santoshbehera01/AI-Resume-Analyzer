import { useState, useEffect } from "react";
import { type AnalysisResult } from "@/lib/resumeAnalyzer";

interface PreviewData {
  result: AnalysisResult;
  resumeText: string;
}

const PREVIEW_KEY = "ats-preview-data";

export function usePreviewData() {
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(PREVIEW_KEY);
      if (stored) {
        const data = JSON.parse(stored) as PreviewData;
        setPreviewData(data);
      }
    } catch (error) {
      console.error("Error loading preview data:", error);
    }
  }, []);

  const savePreviewData = (data: PreviewData) => {
    try {
      localStorage.setItem(PREVIEW_KEY, JSON.stringify(data));
      setPreviewData(data);
    } catch (error) {
      console.error("Error saving preview data:", error);
    }
  };

  const clearPreviewData = () => {
    localStorage.removeItem(PREVIEW_KEY);
    setPreviewData(null);
  };

  return {
    previewData,
    savePreviewData,
    clearPreviewData
  };
}