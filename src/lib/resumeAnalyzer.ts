// Dynamic NLP-like keyword extraction engine
// No fixed skill lists - extracts dynamically from both resume and JD

export interface AnalysisResult {
  score: number;
  matchScore: number;
  skills: string[];
  missingSkills: string[];
  suggestions: string[];
  categories: { name: string; score: number; maxScore: number }[];
  resumeWordCount: number;
  keywordDensity: number;
  sectionsFound: string[];
  sectionsMissing: string[];
  strength: "Weak" | "Average" | "Strong";
  strongAreas: string[];
  weakAreas: string[];
}

export interface MultiRoleResult {
  role: string;
  score: number;
  matchScore: number;
  matchedSkills: string[];
  missingSkills: string[];
}

export interface HistoryEntry {
  id: string;
  date: string;
  score: number;
  matchScore: number;
  strength: string;
  skillsCount: number;
  missingCount: number;
}

// Stop words to filter out common words
const STOP_WORDS = new Set([
  "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for", "of", "with",
  "by", "from", "as", "is", "was", "are", "were", "been", "be", "have", "has", "had",
  "do", "does", "did", "will", "would", "could", "should", "may", "might", "shall",
  "can", "need", "must", "it", "its", "this", "that", "these", "those", "i", "you",
  "he", "she", "we", "they", "me", "him", "her", "us", "them", "my", "your", "his",
  "our", "their", "what", "which", "who", "whom", "where", "when", "why", "how",
  "all", "each", "every", "both", "few", "more", "most", "other", "some", "such",
  "no", "not", "only", "own", "same", "so", "than", "too", "very", "just", "about",
  "above", "after", "again", "also", "am", "any", "because", "before", "between",
  "during", "here", "if", "into", "over", "then", "there", "through", "under",
  "until", "up", "while", "etc", "e.g", "i.e", "per", "via", "using", "used",
  "work", "working", "worked", "able", "across", "well", "new", "get", "got",
  "make", "made", "use", "including", "include", "within", "along", "based",
  "experience", "experienced", "strong", "good", "knowledge", "understanding",
  "skills", "skill", "ability", "responsible", "responsibilities", "required",
  "requirements", "preferred", "minimum", "years", "year", "role", "position",
  "team", "company", "candidate", "looking", "seeking", "join", "apply",
  "application", "resume", "please", "must", "will", "ensure", "provide",
  "support", "develop", "developing", "developed", "development",
]);

// Known tech compounds to preserve
const COMPOUND_TERMS = [
  "machine learning", "deep learning", "natural language processing",
  "data analysis", "data visualization", "data science", "data engineering",
  "web development", "mobile development", "full stack", "front end", "back end",
  "project management", "product management", "version control",
  "ci/cd", "rest api", "restful api", "unit testing", "test driven",
  "object oriented", "cloud computing", "big data", "computer vision",
  "neural network", "artificial intelligence", "problem solving",
  "critical thinking", "cross functional", "agile methodology",
  "continuous integration", "continuous deployment",
  "user experience", "user interface", "power bi",
  "node.js", "next.js", "vue.js", "react.js", "express.js",
  "asp.net", ".net", "c++", "c#", "visual studio",
  "google cloud", "amazon web services",
  "github actions", "vs code",
];

function extractKeywords(text: string): string[] {
  const lower = text.toLowerCase();
  const found: Set<string> = new Set();

  // Extract compound terms first
  for (const term of COMPOUND_TERMS) {
    const regex = new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    if (regex.test(lower)) {
      found.add(term.toLowerCase());
    }
  }

  // Extract single keywords (2+ chars, not stop words, not purely numeric)
  const words = lower.match(/[a-z][a-z0-9.#+\-]{1,30}/g) || [];
  for (const w of words) {
    const clean = w.replace(/^[.\-]+|[.\-]+$/g, '');
    if (clean.length >= 2 && !STOP_WORDS.has(clean) && !/^\d+$/.test(clean)) {
      found.add(clean);
    }
  }

  return Array.from(found);
}

const EXPECTED_SECTIONS = ["education", "experience", "projects", "skills", "summary", "objective", "certifications", "achievements"];

function detectSections(text: string): { found: string[]; missing: string[] } {
  const lower = text.toLowerCase();
  const found: string[] = [];
  const missing: string[] = [];

  for (const section of EXPECTED_SECTIONS) {
    const regex = new RegExp(`(^|\\n)\\s*${section}[:\\s]*`, 'i');
    if (regex.test(lower) || lower.includes(section)) {
      found.push(section.charAt(0).toUpperCase() + section.slice(1));
    } else {
      missing.push(section.charAt(0).toUpperCase() + section.slice(1));
    }
  }
  return { found, missing };
}

// Categorize keywords heuristically
const CATEGORY_PATTERNS: Record<string, RegExp> = {
  "Programming": /^(python|javascript|typescript|java|c\+\+|c#|ruby|go|rust|swift|kotlin|php|scala|r|matlab|perl|lua|dart|elixir|haskell|clojure)$/i,
  "Frontend": /^(react|angular|vue|svelte|next\.js|html|css|sass|tailwind|bootstrap|jquery|webpack|vite|gatsby|nuxt|remix|astro)$/i,
  "Backend": /^(node\.js|express|django|flask|spring|fastapi|rails|laravel|asp\.net|graphql|rest\s?api|nestjs|koa|gin|fiber)$/i,
  "Database": /^(sql|mysql|postgresql|mongodb|redis|firebase|dynamodb|cassandra|elasticsearch|sqlite|oracle|mariadb|neo4j|supabase)$/i,
  "Cloud & DevOps": /^(aws|azure|gcp|docker|kubernetes|terraform|ci\/cd|jenkins|github\s?actions|vercel|heroku|netlify|linux|nginx|ansible|helm)$/i,
  "Data & AI": /^(machine\s?learning|deep\s?learning|tensorflow|pytorch|pandas|numpy|scikit|nlp|data\s?analysis|data\s?visualization|tableau|power\s?bi|keras|opencv|natural\s?language|neural\s?network|artificial\s?intelligence|computer\s?vision|big\s?data|data\s?science)$/i,
  "Tools": /^(git|jira|figma|postman|vs\s?code|slack|confluence|notion|trello|asana|bitbucket|gitlab|visual\s?studio|intellij|xcode)$/i,
  "Soft Skills": /^(leadership|communication|teamwork|problem\s?solving|project\s?management|critical\s?thinking|collaboration|agile|scrum|mentoring|analytical|creative|adaptable|presentation|negotiation)$/i,
};

function categorizeSkills(skills: string[]): { name: string; score: number; maxScore: number }[] {
  const cats: Record<string, { found: number; total: number }> = {};
  for (const [name] of Object.entries(CATEGORY_PATTERNS)) {
    cats[name] = { found: 0, total: 0 };
  }

  for (const skill of skills) {
    for (const [name, regex] of Object.entries(CATEGORY_PATTERNS)) {
      if (regex.test(skill)) {
        cats[name].found++;
        cats[name].total++;
        break;
      }
    }
  }

  return Object.entries(cats)
    .filter(([, v]) => v.total > 0)
    .map(([name, v]) => ({ name, score: v.found, maxScore: Math.max(v.total, 1) }));
}

// Multi-role job description templates
const ROLE_TEMPLATES: Record<string, string> = {
  "Software Developer": "python java javascript typescript react node.js sql git docker kubernetes ci/cd rest api agile scrum data structures algorithms object oriented design patterns unit testing problem solving",
  "Data Analyst": "python sql excel tableau power bi data analysis data visualization pandas numpy statistics machine learning r jupyter notebook data cleaning etl reporting dashboard critical thinking communication",
  "Web Developer": "html css javascript typescript react angular vue node.js express mongodb postgresql rest api graphql tailwind bootstrap responsive design git webpack figma ui ux",
  "DevOps Engineer": "docker kubernetes aws azure gcp terraform ansible jenkins ci/cd linux bash python git monitoring prometheus grafana nginx yaml helm infrastructure",
  "ML Engineer": "python tensorflow pytorch scikit-learn pandas numpy deep learning machine learning natural language processing computer vision data science jupyter notebook sql docker kubernetes mlops",
};

export function analyzeMultiRole(resumeText: string): MultiRoleResult[] {
  const resumeKeywords = extractKeywords(resumeText);

  return Object.entries(ROLE_TEMPLATES).map(([role, template]) => {
    const roleKeywords = extractKeywords(template);
    const matched = resumeKeywords.filter(s => roleKeywords.includes(s));
    const missing = roleKeywords.filter(s => !resumeKeywords.includes(s));
    const matchScore = roleKeywords.length > 0 ? Math.round((matched.length / roleKeywords.length) * 100) : 0;
    const score = Math.min(Math.round(matchScore * 0.7 + Math.min(matched.length * 2, 30)), 100);

    return { role, score, matchScore, matchedSkills: matched, missingSkills: missing };
  });
}

export function analyzeResume(resumeText: string, jobDescription: string): AnalysisResult {
  const resumeKeywords = extractKeywords(resumeText);
  const jdKeywords = extractKeywords(jobDescription);

  const matchedSkills = resumeKeywords.filter(s => jdKeywords.includes(s));
  const missingSkills = jdKeywords.filter(s => !resumeKeywords.includes(s));

  const matchScore = jdKeywords.length > 0 ? Math.round((matchedSkills.length / jdKeywords.length) * 100) : 0;

  const categories = categorizeSkills(resumeKeywords);

  const { found: sectionsFound, missing: sectionsMissing } = detectSections(resumeText);

  // Overall score calculation
  const wordCount = resumeText.split(/\s+/).filter(Boolean).length;
  const lengthScore = wordCount > 200 && wordCount < 1200 ? 15 : wordCount > 100 ? 10 : 5;
  const skillScore = Math.min(resumeKeywords.length * 2, 30);
  const matchBonus = Math.round(matchScore * 0.35);
  const sectionScore = Math.min(sectionsFound.length * 3, 15);
  const formatScore = /\d+%|\d+\+|\$\d/.test(resumeText) ? 5 : 0; // quantifiable achievements
  const overallScore = Math.min(lengthScore + skillScore + matchBonus + sectionScore + formatScore, 100);

  // Strength
  const strength: "Weak" | "Average" | "Strong" = overallScore >= 70 ? "Strong" : overallScore >= 40 ? "Average" : "Weak";

  // Strong & weak areas
  const strongAreas: string[] = [];
  const weakAreas: string[] = [];

  if (matchScore >= 60) strongAreas.push("Good keyword match with job description");
  else weakAreas.push("Low keyword match — tailor resume to the JD");

  if (sectionsFound.length >= 5) strongAreas.push("Well-structured resume with key sections");
  else weakAreas.push(`Missing sections: ${sectionsMissing.slice(0, 3).join(", ")}`);

  if (resumeKeywords.length >= 10) strongAreas.push("Rich technical vocabulary");
  else weakAreas.push("Add more technical skills and keywords");

  if (wordCount >= 200 && wordCount <= 1200) strongAreas.push("Appropriate resume length");
  else if (wordCount < 200) weakAreas.push("Resume is too short — add more detail");
  else weakAreas.push("Resume is too long — condense to 1-2 pages");

  if (/\d+%|\d+\+|\$\d/.test(resumeText)) strongAreas.push("Includes quantifiable achievements");
  else weakAreas.push("Add measurable achievements (%, $, numbers)");

  // Suggestions
  const suggestions: string[] = [];
  if (missingSkills.length > 0) {
    suggestions.push(`Add these keywords from the job description: ${missingSkills.slice(0, 5).join(", ")}`);
  }
  if (wordCount < 200) suggestions.push("Expand your resume with more details about experience and projects.");
  if (wordCount > 1200) suggestions.push("Condense your resume to 1-2 pages for better ATS readability.");
  if (!resumeText.toLowerCase().includes("project")) suggestions.push("Include a Projects section to showcase practical experience.");
  if (sectionsMissing.includes("Education")) suggestions.push("Add an Education section.");
  if (sectionsMissing.includes("Experience")) suggestions.push("Add a Work Experience section with action verbs.");
  if (sectionsMissing.includes("Skills")) suggestions.push("Add a dedicated Skills section for ATS keyword scanning.");
  if (matchScore < 50) suggestions.push("Tailor your resume more closely to the job description keywords.");
  if (!/\b(led|managed|developed|created|designed|implemented|built|improved|increased|reduced)\b/i.test(resumeText)) {
    suggestions.push("Use strong action verbs: led, developed, implemented, improved, etc.");
  }
  if (!/\d+%|\d+\+|\$\d/.test(resumeText)) {
    suggestions.push("Add measurable achievements (e.g., 'increased efficiency by 30%').");
  }
  if (suggestions.length === 0) {
    suggestions.push("Excellent resume! Consider fine-tuning formatting for maximum ATS compatibility.");
  }

  return {
    score: overallScore,
    matchScore,
    skills: matchedSkills,
    missingSkills,
    suggestions,
    categories,
    resumeWordCount: wordCount,
    keywordDensity: wordCount > 0 ? Math.round((resumeKeywords.length / wordCount) * 1000) / 10 : 0,
    sectionsFound,
    sectionsMissing,
    strength,
    strongAreas,
    weakAreas,
  };
}

// History management
const HISTORY_KEY = "ats-analysis-history";

export function saveToHistory(result: AnalysisResult): HistoryEntry {
  const entry: HistoryEntry = {
    id: Date.now().toString(),
    date: new Date().toLocaleString(),
    score: result.score,
    matchScore: result.matchScore,
    strength: result.strength,
    skillsCount: result.skills.length,
    missingCount: result.missingSkills.length,
  };

  const history = getHistory();
  history.unshift(entry);
  if (history.length > 20) history.pop();
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  return entry;
}

export function getHistory(): HistoryEntry[] {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
  } catch {
    return [];
  }
}

export function clearHistory(): void {
  localStorage.removeItem(HISTORY_KEY);
}
