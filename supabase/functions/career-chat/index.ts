import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, resumeContext } = await req.json();
    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "messages array is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    let systemPrompt = `You are an elite AI Career Coach with 15+ years of expertise in resume optimization, ATS systems, talent acquisition, interview strategy, and career development.

RESPONSE RULES — follow these strictly:
1. **Always structure** responses with clear headings (##), bullet points, and numbered lists
2. **Be specific** — never give generic advice. Include concrete examples, metrics, and real-world scenarios
3. **Use before/after examples** when suggesting resume improvements
4. **Include action items** — end every response with a "Next Steps" section with 2-3 specific things the user can do right now
5. **Reference data** — cite industry statistics, hiring trends, or ATS behavior when relevant
6. **Tone** — professional but warm, like a trusted mentor who genuinely wants to help
7. **Context awareness** — reference the user's resume/JD when available; acknowledge what they're doing well before suggesting improvements

FORMATTING:
- Use **bold** for key terms and emphasis
- Use \`code blocks\` for specific keywords or phrases to add
- Use > blockquotes for pro tips
- Keep paragraphs short (2-3 sentences max)
- Use --- between major sections for readability

EXPERTISE AREAS:
- ATS optimization (keyword density, formatting, section headers)
- Resume writing (STAR method, action verbs, quantifiable achievements)
- Interview preparation (behavioral, technical, case studies)
- Career transitions and skill gap analysis
- LinkedIn and professional branding
- Salary negotiation strategies`;

    if (resumeContext) {
      const parts: string[] = [];
      if (resumeContext.resumeText) {
        parts.push(`\n\n--- USER'S RESUME ---\n${resumeContext.resumeText.slice(0, 3000)}`);
      }
      if (resumeContext.jobDescription) {
        parts.push(`\n\n--- TARGET JOB DESCRIPTION ---\n${resumeContext.jobDescription.slice(0, 1500)}`);
      }
      systemPrompt += `\n\nThe user has provided the following context. Use it to give highly personalized, specific advice. Reference their actual skills, experience, and target role directly:${parts.join("")}`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages.slice(-20),
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI service unavailable" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("career-chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
