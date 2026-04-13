import { supabase } from "@/integrations/supabase/client";
import type { AnalysisResult } from "./resumeAnalyzer";

export async function saveAnalysis(userId: string, result: AnalysisResult) {
  const { error } = await supabase.from("analyses").insert({
    user_id: userId,
    ats_score: result.score,
    match_score: result.matchScore,
    strength: result.strength,
    skills_count: result.skills.length,
    missing_count: result.missingSkills.length,
    result_json: result as any,
  });
  if (error) console.error("Failed to save analysis:", error);
}

export interface AnalysisHistoryEntry {
  id: string;
  ats_score: number;
  match_score: number;
  strength: string;
  skills_count: number;
  missing_count: number;
  created_at: string;
}

export async function getAnalysisHistory(): Promise<AnalysisHistoryEntry[]> {
  const { data, error } = await supabase
    .from("analyses")
    .select("id, ats_score, match_score, strength, skills_count, missing_count, created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("Failed to load history:", error);
    return [];
  }
  return data ?? [];
}

export async function deleteAnalysis(id: string) {
  const { error } = await supabase.from("analyses").delete().eq("id", id);
  if (error) console.error("Failed to delete analysis:", error);
}

export async function clearAllAnalyses() {
  const { error } = await supabase.from("analyses").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  if (error) console.error("Failed to clear analyses:", error);
}
