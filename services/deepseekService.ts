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

  const prompt = `
TARGET AUDIENCE: ${request.audience}
CATEGORY: ${request.category}
TOPIC: ${request.topic}
${frameworkDirective}
${searchDirective}

Write a high-impact LinkedIn post that follows the Art Flaneur/Eva voice:
1. Open with a strong hook.
2. Use short paragraphs with clean breaks for readability.
3. Share tangible examples relevant to ${request.audience}.
4. Close with a question or CTA that inspires responses.
5. Output valid Markdown only.
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

  const text = data.choices?.[0]?.message?.content?.trim() || "No content generated.";
  const sourceLinks = extractLinks(text);

  return {
    title: `${request.category}: ${request.topic}`,
    content: text,
    frameworkUsed: request.frameworkId || "Auto-detected based on content",
    rationale: "Generated via DeepSeek chat completion.",
    sourceLinks: sourceLinks.length > 0 ? sourceLinks : undefined
  };
};
