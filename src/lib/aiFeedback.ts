import { supabase } from "@/integrations/supabase/client";

export interface SectionRating {
  rating: "strong" | "average" | "weak";
  feedback: string;
}

export interface BulletImprovement {
  original: string;
  improved: string;
}

export interface AIFeedback {
  overallFeedback: string;
  sectionFeedback: {
    experience?: SectionRating;
    skills?: SectionRating;
    projects?: SectionRating;
    education?: SectionRating;
    formatting?: SectionRating;
  };
  bulletPointImprovements: BulletImprovement[];
  missingSkillsSuggestions: string[];
  actionVerbSuggestions: string[];
  keyRecommendations: string[];
}

export async function getAIFeedback(resumeText: string, jobDescription: string): Promise<AIFeedback> {
  const { data, error } = await supabase.functions.invoke("analyze-resume", {
    body: { resumeText, jobDescription },
  });

  if (error) {
    console.error("AI feedback error:", error);
    throw new Error(error.message || "Failed to get AI feedback");
  }

  return data as AIFeedback;
}
