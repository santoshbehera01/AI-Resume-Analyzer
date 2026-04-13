import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { resumeText, jobDescription } = await req.json();
    if (!resumeText || !jobDescription) {
      return new Response(JSON.stringify({ error: "resumeText and jobDescription are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are an expert career coach and ATS (Applicant Tracking System) specialist. Analyze the resume against the job description and provide detailed, personalized, actionable feedback.

Return a JSON object with EXACTLY this structure (no markdown, no code fences, just raw JSON):
{
  "overallFeedback": "2-3 sentence executive summary of the resume's strength relative to the job",
  "sectionFeedback": {
    "experience": { "rating": "strong|average|weak", "feedback": "specific feedback about experience section" },
    "skills": { "rating": "strong|average|weak", "feedback": "specific feedback about skills alignment" },
    "projects": { "rating": "strong|average|weak", "feedback": "specific feedback about projects section" },
    "education": { "rating": "strong|average|weak", "feedback": "specific feedback about education" },
    "formatting": { "rating": "strong|average|weak", "feedback": "specific feedback about resume format and structure" }
  },
  "bulletPointImprovements": [
    { "original": "weak bullet point from resume or description of issue", "improved": "rewritten stronger version with action verbs and metrics" }
  ],
  "missingSkillsSuggestions": ["skill 1 - why it matters for this role", "skill 2 - why it matters"],
  "actionVerbSuggestions": ["Use 'spearheaded' instead of 'worked on'", "Replace 'helped' with 'facilitated'"],
  "keyRecommendations": ["Top priority recommendation 1", "Priority recommendation 2", "Priority recommendation 3"]
}

Be specific to THIS resume and THIS job. Reference actual content from both. Don't be generic.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: `RESUME:\n${resumeText.slice(0, 4000)}\n\nJOB DESCRIPTION:\n${jobDescription.slice(0, 2000)}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    // Parse the JSON from the response (handle potential markdown fences)
    let parsed;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(content);
    } catch {
      parsed = { overallFeedback: content, sectionFeedback: {}, bulletPointImprovements: [], missingSkillsSuggestions: [], actionVerbSuggestions: [], keyRecommendations: [] };
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-resume error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
