import { PostRequest, GeneratedPost, SourceLink } from "../types";
import { SYSTEM_CONTEXT } from "../constants";

interface DeepSeekResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
}

const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions";
const DEEPSEEK_PROXY_PATH = "/api/deepseek";
const DEEPSEEK_MODEL = "deepseek-chat";

const isServer = typeof window === "undefined";
const getEndpoint = () => (isServer ? DEEPSEEK_API_URL : DEEPSEEK_PROXY_PATH);

const getRequestHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json"
  };

  if (isServer) {
    const apiKey = process.env?.DEEPSEEK_API_KEY || process.env?.API_KEY;
    if (!apiKey) {
      throw new Error("DeepSeek API key is not configured on the server environment.");
    }
    headers.Authorization = `Bearer ${apiKey}`;
  }

  return headers;
};

const extractLinks = (markdown: string): SourceLink[] => {
  const links: SourceLink[] = [];
  const seen = new Set<string>();
  const linkRegex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
  let match: RegExpExecArray | null;

  while ((match = linkRegex.exec(markdown)) !== null) {
    const title = match[1].trim();
    const url = match[2].trim();

    if (!seen.has(url)) {
      links.push({ title, url });
      seen.add(url);
    }
  }

  return links;
};

export const generateLinkedInPost = async (request: PostRequest): Promise<GeneratedPost> => {
  const frameworkDirective = request.frameworkId
    ? `Use framework "${request.frameworkId}" exactly as defined.`
    : `Select the most relevant framework inside ${request.category} and mention it explicitly in the first line (e.g., "Framework Used: ...").`;

  const searchDirective = request.includeNews
    ? "If possible, weave in 1-2 timely facts from reputable sources published within the last 12 months. Every fact must include a Markdown link to the original source."
    : "";

  let specificInstructions = `
1. Open with a strong hook.
2. Use short paragraphs with clean breaks for readability.
3. Share tangible examples relevant to ${request.audience}.
4. Close with a question or CTA that inspires responses.
5. Output valid Markdown only.
`;

  if (request.frameworkId === "Framework 70") {
    specificInstructions = `
1. Create a "TOP-3 News" post.
2. The TOPIC contains 3 links to news items.
3. For each link, write a short, engaging accompaniment/summary (2-3 sentences) in the Art Flaneur voice.
4. Include the link for each item.
5. Open with a catchy headline about "Art World News" or similar.
6. Output valid Markdown only.
`;
  }

  const prompt = `
AUTHOR CONTEXT:
- Industry: ${request.userContext?.industry || 'Art & Culture'}
- Role: ${request.userContext?.role || 'Thought Leader'}
- Location: ${request.userContext?.city ? `${request.userContext.city}, ` : ''}${request.userContext?.country || 'Global'}
- Target Reader Profile: ${request.userContext?.targetAudience || request.audience}

TARGET AUDIENCE: ${request.audience}
CATEGORY: ${request.category}
TOPIC: ${request.topic}
GOAL: ${request.goal}
TONE: ${request.tone}
${frameworkDirective}
${searchDirective}

Write a high-impact LinkedIn post that follows the Art Flaneur/Eva voice, but adapted to the Author Context above.
ALSO, generate a short version (max 280 chars) for X/Threads.
ALSO, generate a Telegram version (use **bold** for emphasis, [text](url) for hidden links).
ALSO, generate an Instagram Caption (engaging, more emojis, "link in bio", NO links in text).
ALSO, generate a YouTube Script Outline (3-5 key bullet points for a video script).
ALSO, generate 5 alternative "Hooks" (opening lines) for the LinkedIn post.

${specificInstructions}

IMPORTANT:
1. Adopt the requested TONE (${request.tone}).
2. Ensure the Call to Action (CTA) matches the GOAL (${request.goal}).
3. Separate the sections with specific delimiters.

Structure your response exactly like this:

[LinkedIn Post Content]

---SHORT_VERSION---

[Short Version Content]

---TELEGRAM_VERSION---

[Telegram Content]

---INSTAGRAM_VERSION---

[Instagram Content]

---YOUTUBE_VERSION---

[YouTube Content]

---HOOKS---

1. [Hook Option 1]
2. [Hook Option 2]
3. [Hook Option 3]
4. [Hook Option 4]
5. [Hook Option 5]

CONSTRAINT: Do NOT use the em dash character ("—"). It is a dead giveaway of AI. You MUST use a standard hyphen ("-") or double hyphen ("--") instead.
STYLE GUIDE: Write like a human, not an AI. Avoid "AI-isms" like "In the ever-evolving landscape", "delve deep", "testament to", "game-changer". Be punchy. Be raw. Use sentence fragments.
CRITICAL: Do NOT fabricate facts, statistics, or quotes. Do NOT cite sources that do not exist. If you mention a specific event, study, or news item, it must be real and verifiable. If you are unsure of a fact, do not include it. STRICT BAN ON HALLUCINATIONS.
`.trim();

  const body = {
    model: DEEPSEEK_MODEL,
    temperature: 0.7,
    messages: [
      { role: "system", content: SYSTEM_CONTEXT },
      { role: "user", content: prompt }
    ]
  };

  let rawResponse: string;
  const endpoint = getEndpoint();
  const headers = getRequestHeaders();
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify(body)
    });

    rawResponse = await response.text();

    if (!response.ok) {
      console.error("DeepSeek API Error:", rawResponse);
      throw new Error("Failed to generate post. Please check your API key or try again.");
    }
  } catch (error) {
    console.error("DeepSeek Request Error:", error);
    throw new Error("Failed to contact DeepSeek. Ensure the local proxy server is running and the API key is configured.");
  }

  let data: DeepSeekResponse;
  try {
    data = JSON.parse(rawResponse) as DeepSeekResponse;
  } catch (parseError) {
    console.error("DeepSeek Response Parse Error:", parseError, rawResponse);
    throw new Error("Received an unexpected response from DeepSeek.");
  }

  const fullText = data.choices?.[0]?.message?.content?.trim() || "No content generated.";
  
  // Parse the sections
  // Helper to safely extract content between delimiters
  const extractSection = (text: string, startDelimiter: string, endDelimiter?: string) => {
    const parts = text.split(startDelimiter);
    if (parts.length < 2) return "";
    const content = parts[1];
    if (endDelimiter) {
      return content.split(endDelimiter)[0].trim();
    }
    return content.trim();
  };

  const linkedInContent = fullText.split("---SHORT_VERSION---")[0].trim();
  const shortContent = extractSection(fullText, "---SHORT_VERSION---", "---TELEGRAM_VERSION---");
  const telegramContent = extractSection(fullText, "---TELEGRAM_VERSION---", "---INSTAGRAM_VERSION---");
  const instagramContent = extractSection(fullText, "---INSTAGRAM_VERSION---", "---YOUTUBE_VERSION---");
  const youtubeContent = extractSection(fullText, "---YOUTUBE_VERSION---", "---HOOKS---");
  
  let hooks: string[] = [];
  const hooksSection = extractSection(fullText, "---HOOKS---");
  if (hooksSection) {
      hooks = hooksSection.split("\n")
        .map(line => line.replace(/^\d+\.\s*/, '').trim())
        .filter(line => line.length > 0);
  }

  const sourceLinks = extractLinks(linkedInContent);

  return {
    title: `${request.category}: ${request.topic}`,
    content: linkedInContent,
    shortContent: shortContent || undefined,
    telegramContent: telegramContent || undefined,
    instagramContent: instagramContent || undefined,
    youtubeContent: youtubeContent || undefined,
    alternativeHooks: hooks.length > 0 ? hooks : undefined,
    frameworkUsed: request.frameworkId || "Auto-detected based on content",
    rationale: "Generated via DeepSeek chat completion.",
    sourceLinks: sourceLinks.length > 0 ? sourceLinks : undefined
  };
};
