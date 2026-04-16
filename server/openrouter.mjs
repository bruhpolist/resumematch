const DEFAULT_BASE_URL = "https://openrouter.ai/api/v1";
const DEFAULT_MODEL = "qwen/qwen3.6-plus-preview:free";

const extractJsonObject = (raw) => {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) return trimmed;

  const fenced = trimmed.match(/```json\s*([\s\S]*?)```/i);
  if (fenced?.[1]) return fenced[1].trim();

  const first = trimmed.indexOf("{");
  const last = trimmed.lastIndexOf("}");
  if (first >= 0 && last > first) return trimmed.slice(first, last + 1);
  return null;
};

const normalizeTips = (tips, withExplanation = true) => {
  if (!Array.isArray(tips)) return [];
  return tips
    .map((tip) => ({
      type: tip?.type === "good" ? "good" : "improve",
      tip: typeof tip?.tip === "string" ? tip.tip.trim() : "",
      explanation:
        withExplanation && typeof tip?.explanation === "string"
          ? tip.explanation.trim()
          : undefined,
    }))
    .filter((tip) => tip.tip.length > 0);
};

const normalizeScore = (value) => {
  const score = Number(value);
  if (!Number.isFinite(score)) return 0;
  return Math.max(0, Math.min(100, Math.round(score)));
};

const normalizeStringList = (list) =>
  Array.isArray(list)
    ? list.filter((item) => typeof item === "string").map((item) => item.trim()).filter(Boolean)
    : [];

const normalizePhrasings = (list) =>
  Array.isArray(list)
    ? list
        .map((item) => ({
          original: typeof item?.original === "string" ? item.original.trim() : "",
          improved: typeof item?.improved === "string" ? item.improved.trim() : "",
          reason: typeof item?.reason === "string" ? item.reason.trim() : "",
        }))
        .filter((item) => item.original && item.improved)
    : [];

const normalizeFeedback = (feedback) => ({
  overallScore: normalizeScore(feedback?.overallScore),
  strengths: normalizeStringList(feedback?.strengths),
  weaknesses: normalizeStringList(feedback?.weaknesses),
  recommendations: normalizeStringList(feedback?.recommendations),
  errorsAndGaps: normalizeStringList(feedback?.errorsAndGaps),
  improvedPhrasings: normalizePhrasings(feedback?.improvedPhrasings),
  ATS: {
    score: normalizeScore(feedback?.ATS?.score),
    tips: normalizeTips(feedback?.ATS?.tips, false),
  },
  toneAndStyle: {
    score: normalizeScore(feedback?.toneAndStyle?.score),
    tips: normalizeTips(feedback?.toneAndStyle?.tips, true),
  },
  content: {
    score: normalizeScore(feedback?.content?.score),
    tips: normalizeTips(feedback?.content?.tips, true),
  },
  structure: {
    score: normalizeScore(feedback?.structure?.score),
    tips: normalizeTips(feedback?.structure?.tips, true),
  },
  skills: {
    score: normalizeScore(feedback?.skills?.score),
    tips: normalizeTips(feedback?.skills?.tips, true),
  },
});

const buildPrompt = ({ resumeText, resumeData, jobDescription }) => [
  "You are a strict ATS and resume reviewer.",
  "Return ONLY valid JSON with this exact shape:",
  "{",
  '  "overallScore": number,',
  '  "strengths": string[],',
  '  "weaknesses": string[],',
  '  "recommendations": string[],',
  '  "errorsAndGaps": string[],',
  '  "improvedPhrasings": [{ "original": string, "improved": string, "reason": string }],',
  '  "ATS": { "score": number, "tips": [{ "type":"good|improve", "tip": string }] },',
  '  "toneAndStyle": { "score": number, "tips": [{ "type":"good|improve", "tip": string, "explanation": string }] },',
  '  "content": { "score": number, "tips": [{ "type":"good|improve", "tip": string, "explanation": string }] },',
  '  "structure": { "score": number, "tips": [{ "type":"good|improve", "tip": string, "explanation": string }] },',
  '  "skills": { "score": number, "tips": [{ "type":"good|improve", "tip": string, "explanation": string }] }',
  "}",
  "Requirements:",
  "- Give fair, evidence-based feedback.",
  "- Include both strengths and weak points.",
  "- Include concrete recommendations and missing pieces.",
  "- Include factual errors/gaps and better phrase alternatives when useful.",
  "- Be concise, useful, and actionable.",
  "",
  `Job description (optional): ${jobDescription || "not provided"}`,
  "",
  "Resume (structured JSON):",
  JSON.stringify(resumeData),
  "",
  "Resume (plain text):",
  resumeText || "",
].join("\n");

export const analyzeResume = async ({ resumeData, resumeText, jobDescription, env }) => {
  const apiKey = env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not configured on server");
  }

  const baseUrl = env.OPENROUTER_BASE_URL || DEFAULT_BASE_URL;
  const model = env.OPENROUTER_MODEL || DEFAULT_MODEL;
  const siteUrl = env.OPENROUTER_SITE_URL || "http://localhost:5173";
  const appName = env.OPENROUTER_APP_NAME || "Resume Builder";

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": siteUrl,
      "X-Title": appName,
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content:
            "You analyze resumes and must respond with strict JSON only.",
        },
        {
          role: "user",
          content: buildPrompt({ resumeText, resumeData, jobDescription }),
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `OpenRouter request failed (${response.status}): ${errorText || "unknown error"}`
    );
  }

  const payload = await response.json();
  const content = payload?.choices?.[0]?.message?.content;
  const rawText =
    typeof content === "string"
      ? content
      : Array.isArray(content)
        ? content.map((part) => part?.text || "").join("\n")
        : "";

  const jsonText = extractJsonObject(rawText);
  if (!jsonText) {
    throw new Error("Model returned non-JSON response");
  }

  let parsed;
  try {
    parsed = JSON.parse(jsonText);
  } catch {
    throw new Error("Failed to parse model JSON response");
  }

  return normalizeFeedback(parsed);
};
