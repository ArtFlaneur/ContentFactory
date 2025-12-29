import { Category, PostRequest, GeneratedPost, SourceLink, Language, EmailTemplate } from "../types";
import { SYSTEM_CONTEXT } from "../constants";
import { getAntiAIPrompt, BANNED_AI_PHRASES } from "../constants/antiAIcringe";

interface DeepSeekResponse {
  content?: Array<{
    text?: string;
    type?: string;
  }>;
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
}

type ValidateApiResponse = {
  valid: string[];
  invalid: string[];
};

type SectionName =
  | "LINKEDIN"
  | "SHORT_VERSION"
  | "TELEGRAM_VERSION"
  | "INSTAGRAM_VERSION"
  | "YOUTUBE_VERSION"
  | "EMAIL_VERSION"
  | "HOOKS";

const canonicalizeSectionName = (raw: string): SectionName | null => {
  const key = raw.trim().toLowerCase();

  if (key === "linkedin" || key === "linkedin post" || key === "linkedin post content") return "LINKEDIN";
  if (key === "short_version" || key === "short version" || key === "x" || key === "x / threads" || key === "threads" || key === "twitter") {
    return "SHORT_VERSION";
  }
  if (key === "telegram_version" || key === "telegram" || key === "telegram version") return "TELEGRAM_VERSION";
  if (key === "instagram_version" || key === "instagram" || key === "instagram version") return "INSTAGRAM_VERSION";
  if (key === "youtube_version" || key === "youtube" || key === "youtube version") return "YOUTUBE_VERSION";
  if (key === "email_version" || key === "email" || key === "email template" || key === "email version") return "EMAIL_VERSION";
  if (key === "hooks" || key === "hook" || key === "alt hooks" || key === "alternative hooks") return "HOOKS";

  return null;
};

const parseSectionsByHeadings = (text: string) => {
  const normalized = text.replace(/\r\n/g, "\n");
  const lines = normalized.split("\n");

  const buckets: Record<SectionName, string[]> = {
    LINKEDIN: [],
    SHORT_VERSION: [],
    TELEGRAM_VERSION: [],
    INSTAGRAM_VERSION: [],
    YOUTUBE_VERSION: [],
    EMAIL_VERSION: [],
    HOOKS: []
  };

  let current: SectionName | null = null;
  const preamble: string[] = [];

  // Matches lines like:
  // LinkedIn
  // ## SHORT_VERSION
  // **YOUTUBE_VERSION---
  // Telegram: ...
  const headingRegex = /^\s*(?:[#>*\-–•]+\s*)?(?:[*_]{1,3}\s*)?(linkedin(?:\s+post(?:\s+content)?)?|short_version|short version|x\s*\/\s*threads|twitter|threads|telegram_version|telegram(?:\s+version)?|instagram_version|instagram(?:\s+version)?|youtube_version|youtube(?:\s+version)?|email_version|email(?:\s+version)?|email template|hooks|alternative hooks)\b\s*(?:---+)?\s*:?\s*(.*)$/i;

  for (const line of lines) {
    const match = line.match(headingRegex);
    if (match) {
      const section = canonicalizeSectionName(match[1]);
      if (section) {
        current = section;
        const rest = (match[2] || "").trim();
        if (rest.length > 0) buckets[current].push(rest);
        continue;
      }
    }

    if (current) {
      buckets[current].push(line);
    } else {
      preamble.push(line);
    }
  }

  // If the model didn't label the LinkedIn section explicitly, treat the
  // preamble (everything before the first recognized heading) as LinkedIn.
  if (buckets.LINKEDIN.join("\n").trim().length === 0) {
    const pre = preamble.join("\n").trim();
    if (pre.length > 0) buckets.LINKEDIN = [pre];
  }

  const hasAny = (Object.keys(buckets) as SectionName[]).some((k) => buckets[k].join("\n").trim().length > 0);
  return {
    hasAny,
    linkedIn: buckets.LINKEDIN.join("\n").trim(),
    short: buckets.SHORT_VERSION.join("\n").trim(),
    telegram: buckets.TELEGRAM_VERSION.join("\n").trim(),
    instagram: buckets.INSTAGRAM_VERSION.join("\n").trim(),
    youtube: buckets.YOUTUBE_VERSION.join("\n").trim(),
    email: buckets.EMAIL_VERSION.join("\n").trim(),
    hooksRaw: buckets.HOOKS.join("\n").trim()
  };
};

const normalizeLooseHeadingsToDelimiters = (text: string) => {
  const normalized = text.replace(/\r\n/g, "\n");
  const lines = normalized.split("\n");

  // Convert decorated heading-style sections into strict delimiter lines.
  // Example: "**YOUTUBE_VERSION---" -> "---YOUTUBE_VERSION---"
  const headingRegex = /^\s*(?:[#>*\-–•]+\s*)?(?:[*_]{1,3}\s*)?(linkedin(?:\s+post(?:\s+content)?)?|short_version|short version|x\s*\/\s*threads|twitter|threads|telegram_version|telegram(?:\s+version)?|instagram_version|instagram(?:\s+version)?|youtube_version|youtube(?:\s+version)?|email_version|email(?:\s+version)?|email template|hooks|alternative hooks)\b\s*(?:---+)?\s*:?\s*(.*)$/i;

  const out: string[] = [];
  for (const line of lines) {
    const match = line.match(headingRegex);
    if (!match) {
      out.push(line);
      continue;
    }

    const section = canonicalizeSectionName(match[1]);
    if (!section) {
      out.push(line);
      continue;
    }

    // We treat LinkedIn as the default preamble; drop explicit LinkedIn headings.
    if (section === "LINKEDIN") {
      const rest = (match[2] || '').trim();
      if (rest.length > 0) out.push(rest);
      continue;
    }

    out.push(`---${section}---`);
    const rest = (match[2] || '').trim();
    if (rest.length > 0) out.push(rest);
  }

  return out.join("\n");
};

const stripMarkdownEmphasis = (text: string | undefined) => {
  if (!text) return text;
  // Only intended for places where we render as plain text (e.g. YouTube tab).
  return text.replace(/\*\*/g, '').replace(/\*/g, '').replace(/__/g, '').replace(/_/g, '');
};

const parseEmailTemplateSection = (raw: string): EmailTemplate => {
  const normalized = (raw || '').replace(/\r\n/g, '\n');
  const subjectMatch = normalized.match(/Subject:\s*(.+)/i);
  const greetingMatch = normalized.match(/Greeting:\s*(.+)/i);
  const bodyMatch = normalized.match(/Body:\s*([\s\S]*?)(?:\n\s*Signature:|$)/i);
  const signatureMatch = normalized.match(/Signature:\s*([\s\S]*)$/i);

  return {
    subject: subjectMatch?.[1]?.trim() || '',
    greeting: greetingMatch?.[1]?.trim() || '',
    body: bodyMatch?.[1]?.trim() || '',
    signature: signatureMatch?.[1]?.trim() || ''
  };
};

const looksUnsplit = (linkedInContent: string, shortContent?: string, telegramContent?: string, instagramContent?: string, youtubeContent?: string) => {
  const hasAnyOther = Boolean(shortContent || telegramContent || instagramContent || youtubeContent);
  const containsMarkers = /(SHORT_VERSION|TELEGRAM_VERSION|INSTAGRAM_VERSION|YOUTUBE_VERSION|HOOKS)/i.test(linkedInContent);
  return !hasAnyOther && containsMarkers;
};

const ANTHROPIC_API_URL = "https://eva-mj6ah3dq-eastus2.services.ai.azure.com/anthropic/v1/messages";
const ANTHROPIC_PROXY_PATH = "/api/deepseek";
const ANTHROPIC_MODEL = "claude-opus-4-5-20251101";
const ANTHROPIC_API_VERSION = "2023-06-01";

const isServer = typeof window === "undefined";
const getEndpoint = () => (isServer ? ANTHROPIC_API_URL : ANTHROPIC_PROXY_PATH);

const getRequestHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "anthropic-version": ANTHROPIC_API_VERSION
  };

  if (isServer) {
    const apiKey = process.env?.ANTHROPIC_API_KEY || process.env?.API_KEY;
    if (!apiKey) {
      throw new Error("Anthropic API key is not configured on the server environment.");
    }
    headers["x-api-key"] = apiKey;
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

const stripTrailingSlash = (raw: string) => raw.replace(/\/+$/, '');

const isDisallowedSourceUrl = (raw: string) => {
  try {
    const u = new URL(raw);
    const host = u.hostname.toLowerCase();

    // Block obvious placeholder / demo domains and local hosts.
    const blockedHosts = new Set([
      'example.com',
      'www.example.com',
      'example.org',
      'www.example.org',
      'example.net',
      'www.example.net',
      'localhost',
      '127.0.0.1',
      '0.0.0.0'
    ]);
    if (blockedHosts.has(host)) return true;

    // Some models emit `*.example.com`.
    if (host.endsWith('.example.com') || host.endsWith('.example.org') || host.endsWith('.example.net')) return true;

    return false;
  } catch {
    return true;
  }
};

const uniq = <T,>(arr: T[]) => Array.from(new Set(arr));

const validateUrls = async (urls: string[]): Promise<ValidateApiResponse> => {
  const unique = uniq(urls.map((u) => u.trim()).filter(Boolean)).slice(0, 20);
  if (unique.length === 0) return { valid: [], invalid: [] };

  try {
    const resp = await fetch('/api/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ urls: unique })
    });
    if (!resp.ok) return { valid: [], invalid: [] };
    const data = (await resp.json()) as Partial<ValidateApiResponse>;
    return {
      valid: Array.isArray(data.valid) ? (data.valid as string[]) : [],
      invalid: Array.isArray(data.invalid) ? (data.invalid as string[]) : []
    };
  } catch {
    return { valid: [], invalid: [] };
  }
};

const scrubInvalidUrlLines = (text: string | undefined, invalidUrls: string[]) => {
  if (!text) return text;
  if (!invalidUrls || invalidUrls.length === 0) return text;

  const lines = text.split('\n');
  const filtered = lines.filter((line) => !invalidUrls.some((u) => u && line.includes(u)));
  // Collapse excessive blank lines after removals
  return filtered.join('\n').replace(/\n{3,}/g, '\n\n').trim();
};

const callDeepSeek = async (prompt: string) => {
  const body = {
    model: ANTHROPIC_MODEL,
    max_tokens: 4096,
    temperature: 0.7,
    system: SYSTEM_CONTEXT,
    messages: [
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
      console.error("Anthropic API Error:", rawResponse);
      let errorMessage = "Failed to generate post.";
      try {
        const errorData = JSON.parse(rawResponse);
        if (errorData.error?.message) {
          errorMessage += " " + errorData.error.message;
        }
      } catch {
        // Keep default message
      }
      throw new Error(errorMessage);
    }
  } catch (error) {
    console.error("Anthropic Request Error:", error);
    if (error instanceof Error && error.message.includes("Failed to generate")) {
      throw error; // Re-throw API errors with full message
    }
    throw new Error("Failed to contact Anthropic. Ensure the local proxy server is running and the API key is configured.");
  }

  let data: DeepSeekResponse;
  try {
    data = JSON.parse(rawResponse) as DeepSeekResponse;
  } catch (parseError) {
    console.error("Anthropic Response Parse Error:", parseError, rawResponse);
    throw new Error("Received an unexpected response from Anthropic.");
  }

  return data.content?.[0]?.text?.trim() || data.choices?.[0]?.message?.content?.trim() || "No content generated.";
};

type Platform = 'linkedin' | 'twitter' | 'telegram' | 'instagram' | 'youtube';

const PLATFORM_CHAR_LIMITS: Record<Platform, number> = {
  linkedin: 1250,
  twitter: 280,
  telegram: 4096,
  instagram: 2200,
  youtube: 10000
};

const truncateToCharLimit = (text: string | undefined, limit: number) => {
  if (!text) return text;
  const trimmed = text.trim();
  if (trimmed.length <= limit) return trimmed;

  // Keep room for ellipsis.
  const suffix = '...';
  const max = Math.max(0, limit - suffix.length);
  const candidate = trimmed.slice(0, max);
  const lastSpace = candidate.lastIndexOf(' ');
  const cut = lastSpace > Math.max(30, max - 40) ? candidate.slice(0, lastSpace) : candidate;
  return (cut.trimEnd() + suffix).slice(0, limit);
};

const coercePlatformsToEnforce = (platforms: PostRequest['platforms']): Platform[] => {
  const all: Platform[] = ['linkedin', 'twitter', 'telegram', 'instagram', 'youtube'];
  if (!Array.isArray(platforms) || platforms.length === 0) return all;
  const set = new Set(platforms);
  return all.filter((p) => set.has(p));
};

const generateComment = async (request: PostRequest): Promise<GeneratedPost> => {
  const enforcePlatforms = coercePlatformsToEnforce(request.platforms);
  const limitsForPrompt = enforcePlatforms
    .map((p) => `${p.toUpperCase()}: <= ${PLATFORM_CHAR_LIMITS[p]} chars`)
    .join('\n');

  const outputLanguage = request.language || Language.ENGLISH;
  const antiAIRules = getAntiAIPrompt(outputLanguage);

  const prompt = `
AUTHOR CONTEXT:
- Industry: ${request.userContext?.industry || 'Art & Culture'}
- Role: ${request.userContext?.role || 'Thought Leader'}
- Location: ${request.userContext?.city ? `${request.userContext.city}, ` : ''}${request.userContext?.country || 'Global'}
- Target Reader Profile: ${request.userContext?.targetAudience || request.audience}

OUTPUT LANGUAGE: ${outputLanguage}
Write the entire response in ${outputLanguage}. Do NOT translate headers/delimiters (keep ---SHORT_VERSION--- etc as is).

TASK:
Write a comment reply to the POST TEXT below. This is a *comment*, not a long-form post.
Make it feel human: specific, punchy, high-signal. No fluff.

TARGET AUDIENCE: ${request.audience}
GOAL: ${request.goal}
TONE: ${request.tone}
CATEGORY: Comments

POST TEXT TO REPLY TO:
${request.topic}

OUTPUT RULES:
- Output valid Markdown only.
- Do NOT include links.
- Do NOT use the em dash character ("—"); use '-' or '--' instead.
- For YOUTUBE_VERSION: do NOT use Markdown emphasis markers (*, **, _). If you want emphasis, use direct Unicode bold/italic characters (e.g., 𝗕𝗢𝗟𝗗, 𝘪𝘵𝘢𝘭𝘪𝘤).
- Respect character limits for the platforms the user selected.

CHARACTER LIMITS (count every character, including spaces):
${limitsForPrompt}

Structure your response exactly like this (ensure you include the delimiters):

[LinkedIn Comment]

---SHORT_VERSION---

[X/Threads Comment]

---TELEGRAM_VERSION---

[Telegram Comment]

---INSTAGRAM_VERSION---

[Instagram Comment]

---YOUTUBE_VERSION---

[YouTube Comment]

${antiAIRules}

CRITICAL: Do NOT fabricate facts, statistics, or quotes. If the post mentions a fact you can't verify, respond without adding new facts.
`.trim();

  const fullText = await callDeepSeek(prompt);

  const normalizedText = normalizeLooseHeadingsToDelimiters(fullText);
  const parts = normalizedText.split(/(?:^|\n)\s*---\s*([A-Z_]+)\s*---\s*(?:\n|$)/);

  let linkedInContent = parts[0].trim();
  let shortContent: string | undefined;
  let telegramContent: string | undefined;
  let instagramContent: string | undefined;
  let youtubeContent: string | undefined;

  const parsedByDelimiters = parts.length > 1;

  if (parsedByDelimiters) {
    for (let i = 1; i < parts.length; i += 2) {
      const sectionName = parts[i];
      const sectionContent = parts[i + 1]?.trim();
      if (!sectionContent) continue;

      switch (sectionName) {
        case "SHORT_VERSION":
          shortContent = sectionContent;
          break;
        case "TELEGRAM_VERSION":
          telegramContent = sectionContent;
          break;
        case "INSTAGRAM_VERSION":
          instagramContent = sectionContent;
          break;
        case "YOUTUBE_VERSION":
          youtubeContent = sectionContent;
          break;
      }
    }
    if (looksUnsplit(linkedInContent, shortContent, telegramContent, instagramContent, youtubeContent)) {
      const fallback = parseSectionsByHeadings(normalizedText);
      if (fallback.hasAny) {
        if (fallback.linkedIn) linkedInContent = fallback.linkedIn;
        if (fallback.short) shortContent = fallback.short;
        if (fallback.telegram) telegramContent = fallback.telegram;
        if (fallback.instagram) instagramContent = fallback.instagram;
        if (fallback.youtube) youtubeContent = fallback.youtube;
      }
    }
  } else {
    const fallback = parseSectionsByHeadings(normalizedText);
    if (fallback.hasAny) {
      if (fallback.linkedIn) linkedInContent = fallback.linkedIn;
      if (fallback.short) shortContent = fallback.short;
      if (fallback.telegram) telegramContent = fallback.telegram;
      if (fallback.instagram) instagramContent = fallback.instagram;
      if (fallback.youtube) youtubeContent = fallback.youtube;
    }
  }

  youtubeContent = stripMarkdownEmphasis(youtubeContent);

  const shouldEnforce = (p: Platform) => enforcePlatforms.includes(p);

  linkedInContent = shouldEnforce('linkedin')
    ? (truncateToCharLimit(linkedInContent, PLATFORM_CHAR_LIMITS.linkedin) || '')
    : linkedInContent;
  shortContent = shouldEnforce('twitter')
    ? truncateToCharLimit(shortContent, PLATFORM_CHAR_LIMITS.twitter)
    : shortContent;
  telegramContent = shouldEnforce('telegram')
    ? truncateToCharLimit(telegramContent, PLATFORM_CHAR_LIMITS.telegram)
    : telegramContent;
  instagramContent = shouldEnforce('instagram')
    ? truncateToCharLimit(instagramContent, PLATFORM_CHAR_LIMITS.instagram)
    : instagramContent;
  youtubeContent = shouldEnforce('youtube')
    ? truncateToCharLimit(youtubeContent, PLATFORM_CHAR_LIMITS.youtube)
    : youtubeContent;

  return {
    title: `Comment reply`,
    content: linkedInContent,
    shortContent: shortContent || undefined,
    telegramContent: telegramContent || undefined,
    instagramContent: instagramContent || undefined,
    youtubeContent: youtubeContent || undefined,
    frameworkUsed: 'Comments',
    rationale: 'Generated as a platform-ready comment reply.'
  };
};

export const generateLinkedInPost = async (request: PostRequest): Promise<GeneratedPost> => {
  if (request.category === Category.COMMENTS) {
    return generateComment(request);
  }

  const outputLanguage = request.language || Language.ENGLISH;
  const antiAIRules = getAntiAIPrompt(outputLanguage);

  const frameworkDirective = request.frameworkId
    ? `Use framework "${request.frameworkId}" exactly as defined.`
    : `Select the most relevant framework inside ${request.category} and mention it explicitly in the first line (e.g., "Framework Used: ...").`;

  const hasAllowedSources = Array.isArray(request.sourceUrls) && request.sourceUrls.length > 0;
  const allowedSourcesSet = hasAllowedSources
    ? new Set(request.sourceUrls!.slice(0, 20).map((u) => stripTrailingSlash(u.trim())).filter(Boolean))
    : null;
  const allowedSourcesBlock = hasAllowedSources
    ? `\nALLOWED_SOURCES (you may ONLY cite these exact URLs):\n${request.sourceUrls
        .slice(0, 20)
        .map((u, i) => `${i + 1}. ${u}`)
        .join('\n')}\n`
    : '';

  const searchDirective = request.includeNews
    ? (hasAllowedSources
        ? "You MUST use ONLY the ALLOWED_SOURCES above for any factual claims. For every factual claim, include a Markdown link to ONE of the ALLOWED_SOURCES. NEVER invent, guess, or modify URLs. If you cannot support a claim with ALLOWED_SOURCES, do not include that claim."
        : "Do NOT add external facts, stats, or sources. Do NOT include any links. (No sources were provided.)")
    : "";

  const factCheckDirective = request.includeNews
    ? (hasAllowedSources
        ? `FACT-CHECKING REQUIREMENTS:
- Treat ALLOWED_SOURCES as the only ground truth. No other data, names, or numbers are allowed.
- Every statistic, quote, or news reference MUST be traceable to one of the ALLOWED_SOURCES.
- Cite inline using Markdown links immediately after the sentence they support.
- If the sources do not confirm a claim, explicitly say so or omit the claim entirely.`
        : `FACT-CHECKING REQUIREMENTS:
- News enrichment disabled automatically because no verified sources were supplied.
- Do NOT invent dates, numbers, quotes, or external references.`)
    : '';

  let specificInstructions = `
1. Open with a strong hook.
2. Use short paragraphs with clean breaks for readability.
3. Share tangible examples relevant to ${request.audience}.
4. Close with a question or CTA that inspires responses.
5. Output valid Markdown only.
`;

  // Check if this is a Press Release category
  const isPressRelease = request.category === Category.PRESS_RELEASES;

  if (isPressRelease) {
    const org = request.organizationInfo;
    const organizationContext = org ? `
ORGANIZATION INFORMATION (Use this data in press release):
- Name: ${org.name}
- Location: ${org.city}, ${org.country}
${org.description ? `- About (Boilerplate): ${org.description}` : '- About: [Please provide organization description in press release]'}
${org.website ? `- Website: ${org.website}` : ''}
${org.contactName ? `- Media Contact Name: ${org.contactName}` : '- Media Contact Name: [Please specify]'}
${org.contactEmail ? `- Media Contact Email: ${org.contactEmail}` : '- Media Contact Email: [Please specify]'}
${org.contactPhone ? `- Media Contact Phone: ${org.contactPhone}` : ''}
` : `
ORGANIZATION INFORMATION:
No saved organization data available. Please generate appropriate placeholders for:
- Organization name (infer from context)
- Location (use user context if available)
- Boilerplate description
- Media contact details
`;

    specificInstructions = `
PRESS RELEASE FORMAT (STRICT):

${organizationContext}

1. Create a professional press release following standard gallery/museum format
2. Structure:
   - HEADLINE: Compelling, newsworthy, 10-15 words
   - SUBHEADLINE: Supporting detail, optional
   - RELEASE INFO: "[City, Country] - [Date]" - USE ORGANIZATION LOCATION FROM ABOVE
   - BODY: 3-5 paragraphs with inverted pyramid structure
     * Lead paragraph: Who, What, When, Where, Why
     * Supporting details with quotes
     * Context and significance
     * Practical information (dates, venue, tickets)
   - BOILERPLATE: "About [Gallery/Organization]" - USE ORGANIZATION INFO FROM ABOVE
   - MEDIA CONTACT: USE CONTACT DETAILS FROM ABOVE (or create appropriate placeholders)

3. Style Guidelines:
   - Third person throughout
   - NEVER use first-person singular pronouns (I, my, me / я, меня, мне / je, mon, ma)
   - Write from institutional perspective: use "we" or organization name
   - AP style for dates and numbers
   - Include at least one quote from gallery director/curator/artist
   - Professional, objective tone
   - No hyperbole or marketing speak
   - Factual and newsworthy angle

4. Output format: Use delimiters to separate sections:
---HEADLINE---
[Headline text]

---SUBHEADLINE---
[Subheadline text or leave empty]

---RELEASE_DATE---
[City, Country] - [Date] OR "FOR IMMEDIATE RELEASE"

---BODY---
[Full press release body with paragraphs]

---BOILERPLATE---
About [Organization]:
[Organization description]

---MEDIA_CONTACT---
Name: [Contact name]
Email: [Email address]
Phone: [Optional phone]
`;
  } else if (request.frameworkId === "Framework 70") {
    specificInstructions = `
1. Create a "TOP-3 News" post.
2. The TOPIC contains 3 links to news items.
3. For each link, write a short, engaging accompaniment/summary (2-3 sentences) in the Art Flaneur voice.
4. Include the link for each item.
5. Open with a catchy headline about "Art World News" or similar.
6. Output valid Markdown only.
`;
  }

  // Official/institutional categories (gallery, museum, agency) voice requirements
  const isOfficialCategory = [
    Category.PRESS_RELEASES,
    Category.EXHIBITION_ANNOUNCEMENTS,
    Category.COLLECTOR_COMMUNICATION,
    Category.EVENT_INVITATIONS
  ].includes(request.category);

  const institutionalVoiceRule = isOfficialCategory ? `
CRITICAL VOICE REQUIREMENT FOR OFFICIAL COMMUNICATIONS:
- NEVER use first-person singular pronouns (I, my, me / я, моя, меня, мне, мой / je, mon, ma, me / ich, mein, mir, mich)
- Write from institutional perspective: use "we" / "мы" / "nous" / "wir" or organization name
- Represent the gallery/museum/agency as an entity, not an individual
- Professional, institutional tone throughout
` : '';

  const prompt = `
AUTHOR CONTEXT:
- Industry: ${request.userContext?.industry || 'Art & Culture'}
- Role: ${request.userContext?.role || 'Thought Leader'}
- Location: ${request.userContext?.city ? `${request.userContext.city}, ` : ''}${request.userContext?.country || 'Global'}
- Target Reader Profile: ${request.userContext?.targetAudience || request.audience}

OUTPUT LANGUAGE: ${outputLanguage}
Write the entire response in ${outputLanguage}. Do NOT translate section delimiters (keep ---SHORT_VERSION---, ---TELEGRAM_VERSION---, etc. exactly as written).

TARGET AUDIENCE: ${request.audience}
CATEGORY: ${request.category}
TOPIC: ${request.topic}
GOAL: ${request.goal}
TONE: ${request.tone}
${frameworkDirective}
${searchDirective}
${allowedSourcesBlock}
${factCheckDirective}
${institutionalVoiceRule}

Write a high-impact LinkedIn post that follows the Art Flaneur/Eva voice, but adapted to the Author Context above.
ALSO, generate a short version (max 280 chars) for X/Threads.
ALSO, generate a Telegram version (use **bold** for emphasis, [text](url) for hidden links).
ALSO, generate an Instagram Caption (engaging, more emojis, "link in bio", NO links in text).
ALSO, generate a YouTube Script Outline (3-5 key bullet points for a video script). For emphasis inside YOUTUBE_VERSION, do NOT use Markdown ** or *; use direct Unicode bold/italic characters instead (e.g., 𝗕𝗢𝗟𝗗, 𝘪𝘵𝘢𝘭𝘪𝘤).
ALSO, generate an executive-grade email/collector letter template with Subject, Greeting, Body (2-4 short paragraphs or bullets), and Signature. Keep it formal, make the CTA discreet but clear, and avoid emojis.
ALSO, generate 5 alternative "Hooks" (opening lines) for the LinkedIn post.

${specificInstructions}

IMPORTANT:
1. Adopt the requested TONE (${request.tone}).
2. Ensure the Call to Action (CTA) matches the GOAL (${request.goal}).
3. Separate the sections with specific delimiters.

Structure your response exactly like this (ensure you include the delimiters):

[LinkedIn Post Content]

---SHORT_VERSION---

[Short Version Content]

---TELEGRAM_VERSION---

[Telegram Content]

---INSTAGRAM_VERSION---

[Instagram Content]

---YOUTUBE_VERSION---

[YouTube Content]

---EMAIL_VERSION---

Subject: [Email Subject]
Greeting: [Email greeting line]
Body:
[2-4 paragraphs or bullet points]
Signature:
[Sender name / title]

---HOOKS---

1. [Hook Option 1]
2. [Hook Option 2]
3. [Hook Option 3]
4. [Hook Option 4]
5. [Hook Option 5]

${antiAIRules}

CRITICAL: Do NOT fabricate facts, statistics, or quotes. Do NOT cite sources that do not exist. If you mention a specific event, study, or news item, it must be real and verifiable. If you are unsure of a fact, do not include it. STRICT BAN ON HALLUCINATIONS.
`.trim();

  const fullText = await callDeepSeek(prompt);

  const normalizedText = normalizeLooseHeadingsToDelimiters(fullText);

  // Primary parser: split by strict delimiters like ---SHORT_VERSION---
  // Matches delimiters potentially surrounded by newlines
  const parts = normalizedText.split(/(?:^|\n)\s*---\s*([A-Z_]+)\s*---\s*(?:\n|$)/);

  let linkedInContent = parts[0].trim();
  
  // Clean up "Framework Used" line and "[LinkedIn Post Content]" marker
  let detectedFramework = "Auto-detected based on content";
  
  // Helper to check and remove framework line
  const processContent = (content: string) => {
    let lines = content.split('\n');
    let cleanLines: string[] = [];
    let foundFramework = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      // Skip the placeholder if it appears
      if (line === '[LinkedIn Post Content]') continue;
      
      // Check for Framework Used line (usually at the start)
      if (!foundFramework && line.toLowerCase().includes('framework used:')) {
        detectedFramework = line.split(/framework used:/i)[1]?.trim() || detectedFramework;
        foundFramework = true;
        continue;
      }
      
      // Also handle the case where the placeholder and framework are on the same line
      if (!foundFramework && line.includes('[LinkedIn Post Content]') && line.toLowerCase().includes('framework used:')) {
         detectedFramework = line.split(/framework used:/i)[1]?.trim() || detectedFramework;
         foundFramework = true;
         continue;
      }

      cleanLines.push(lines[i]);
    }
    return cleanLines.join('\n').trim();
  };

  linkedInContent = processContent(linkedInContent);

  let shortContent: string | undefined;
  let telegramContent: string | undefined;
  let instagramContent: string | undefined;
  let youtubeContent: string | undefined;
  let hooks: string[] = [];
  let emailTemplate: EmailTemplate | undefined;
  
  // Press Release specific fields
  let pressReleaseData: GeneratedPost['pressRelease'] | undefined;

  const parsedByDelimiters = parts.length > 1;

  if (parsedByDelimiters) {
    // Assign content based on captured delimiter
    for (let i = 1; i < parts.length; i += 2) {
      const sectionName = parts[i];
      const sectionContent = parts[i + 1]?.trim();

      if (!sectionContent) continue;

      switch (sectionName) {
        case "SHORT_VERSION":
          shortContent = sectionContent;
          break;
        case "TELEGRAM_VERSION":
          telegramContent = sectionContent;
          break;
        case "INSTAGRAM_VERSION":
          instagramContent = sectionContent;
          break;
        case "YOUTUBE_VERSION":
          youtubeContent = sectionContent;
          break;
        case "HOOKS":
          hooks = sectionContent
            .split("\n")
            .map((line) => line.replace(/^\d+\.\s*/, "").trim())
            .filter((line) => line.length > 0);
          break;
        case "EMAIL_VERSION":
          emailTemplate = parseEmailTemplateSection(sectionContent);
          break;
        // Press Release sections
        case "HEADLINE":
          if (!pressReleaseData) pressReleaseData = {} as any;
          pressReleaseData.headline = sectionContent;
          break;
        case "SUBHEADLINE":
          if (!pressReleaseData) pressReleaseData = {} as any;
          pressReleaseData.subheadline = sectionContent;
          break;
        case "RELEASE_DATE":
          if (!pressReleaseData) pressReleaseData = {} as any;
          pressReleaseData.releaseDate = sectionContent;
          // Extract location from format "[City, Country] - [Date]"
          const locationMatch = sectionContent.match(/^([^-]+?)\s*-/);
          if (locationMatch) {
            pressReleaseData.location = locationMatch[1].trim();
          } else {
            pressReleaseData.location = request.userContext?.city && request.userContext?.country 
              ? `${request.userContext.city}, ${request.userContext.country}`
              : 'Location not specified';
          }
          break;
        case "BODY":
          if (!pressReleaseData) pressReleaseData = {} as any;
          pressReleaseData.body = sectionContent;
          break;
        case "BOILERPLATE":
          if (!pressReleaseData) pressReleaseData = {} as any;
          pressReleaseData.boilerplate = sectionContent;
          break;
        case "MEDIA_CONTACT":
          if (!pressReleaseData) pressReleaseData = {} as any;
          // Parse contact info
          const nameMatch = sectionContent.match(/Name:\s*(.+)/i);
          const emailMatch = sectionContent.match(/Email:\s*(.+)/i);
          const phoneMatch = sectionContent.match(/Phone:\s*(.+)/i);
          pressReleaseData.mediaContact = {
            name: nameMatch ? nameMatch[1].trim() : undefined,
            email: emailMatch ? emailMatch[1].trim() : undefined,
            phone: phoneMatch ? phoneMatch[1].trim() : undefined
          };
          break;
      }
    }
  } else {
    // Fallback parser: model sometimes ignores delimiters and outputs section headings instead.
    const fallback = parseSectionsByHeadings(normalizedText);
    if (fallback.hasAny) {
      if (fallback.linkedIn) linkedInContent = processContent(fallback.linkedIn);
      if (fallback.short) shortContent = fallback.short;
      if (fallback.telegram) telegramContent = fallback.telegram;
      if (fallback.instagram) instagramContent = fallback.instagram;
      if (fallback.youtube) youtubeContent = fallback.youtube;
      if (fallback.email) emailTemplate = parseEmailTemplateSection(fallback.email);
      if (fallback.hooksRaw) {
        hooks = fallback.hooksRaw
          .split("\n")
          .map((line) => line.replace(/^\d+\.\s*/, "").trim())
          .filter((line) => line.length > 0);
      }
    }
  }

  // If delimiter parsing “worked” syntactically but still left markers inside
  // the LinkedIn content, salvage via heading-based parsing.
  if (looksUnsplit(linkedInContent, shortContent, telegramContent, instagramContent, youtubeContent)) {
    const fallback = parseSectionsByHeadings(normalizedText);
    if (fallback.hasAny) {
      if (fallback.linkedIn) linkedInContent = processContent(fallback.linkedIn);
      if (fallback.short) shortContent = fallback.short;
      if (fallback.telegram) telegramContent = fallback.telegram;
      if (fallback.instagram) instagramContent = fallback.instagram;
      if (fallback.youtube) youtubeContent = fallback.youtube;
      if (fallback.email) emailTemplate = parseEmailTemplateSection(fallback.email);
      if (fallback.hooksRaw) {
        hooks = fallback.hooksRaw
          .split("\n")
          .map((line) => line.replace(/^\d+\.\s*/, "").trim())
          .filter((line) => line.length > 0);
      }
    }
  }

  if (pressReleaseData) {
    const org = request.organizationInfo;
    if (!org?.contactEmail) {
      throw new Error('Organization contact email is required for press releases. Please fill in your organization details in the Factory Settings.');
    }
    const existingContact = pressReleaseData.mediaContact;
    const mergedContact = {
      name: existingContact?.name?.trim() || org.contactName || 'Media Relations',
      email: existingContact?.email?.trim() || org.contactEmail,
      phone: existingContact?.phone?.trim() || org.contactPhone || undefined
    };
    pressReleaseData.mediaContact = mergedContact;
  }

  youtubeContent = stripMarkdownEmphasis(youtubeContent);

  // Validate and scrub any invalid URLs the model still emitted.
  const allLinks = uniq([
    ...extractLinks(linkedInContent).map((l) => l.url),
    ...(shortContent ? extractLinks(shortContent).map((l) => l.url) : []),
    ...(telegramContent ? extractLinks(telegramContent).map((l) => l.url) : []),
    ...(youtubeContent ? extractLinks(youtubeContent).map((l) => l.url) : []),
    ...(emailTemplate?.body ? extractLinks(emailTemplate.body).map((l) => l.url) : [])
  ]);

  // First pass: remove placeholder/demo URLs regardless of whether they "work".
  const placeholderInvalid = allLinks.filter((u) => isDisallowedSourceUrl(u));

  // If the user provided ALLOWED_SOURCES, treat any non-allowed URL as invalid even if it resolves.
  const nonAllowedInvalid = allowedSourcesSet
    ? allLinks.filter((u) => !allowedSourcesSet.has(stripTrailingSlash(u)))
    : [];

  const preInvalid = uniq([...placeholderInvalid, ...nonAllowedInvalid]);
  const linksToValidate = allLinks.filter((u) => !preInvalid.includes(u));

  const { valid: validUrls, invalid: invalidUrlsFromNetwork } = await validateUrls(linksToValidate);
  const invalidUrls = uniq([...preInvalid, ...invalidUrlsFromNetwork]);
  const validSet = new Set(validUrls);

  if (invalidUrls.length > 0) {
    linkedInContent = scrubInvalidUrlLines(linkedInContent, invalidUrls) || '';
    shortContent = scrubInvalidUrlLines(shortContent, invalidUrls);
    telegramContent = scrubInvalidUrlLines(telegramContent, invalidUrls);
    youtubeContent = scrubInvalidUrlLines(youtubeContent, invalidUrls);
    hooks = hooks.filter((h) => !invalidUrls.some((u) => h.includes(u)));
    if (emailTemplate) {
      emailTemplate = {
        ...emailTemplate,
        body: scrubInvalidUrlLines(emailTemplate.body, invalidUrls) || emailTemplate.body
      };
    }
  }

  const sourceLinks = extractLinks(linkedInContent)
    .filter((l) => !isDisallowedSourceUrl(l.url))
    .filter((l) => (allowedSourcesSet ? allowedSourcesSet.has(stripTrailingSlash(l.url)) : true))
    .filter((l) => (validSet.size === 0 ? true : validSet.has(l.url)));

  return {
    title: `${request.category}: ${request.topic}`,
    content: linkedInContent,
    shortContent: shortContent || undefined,
    telegramContent: telegramContent || undefined,
    instagramContent: instagramContent || undefined,
    youtubeContent: youtubeContent || undefined,
    alternativeHooks: hooks.length > 0 ? hooks : undefined,
    frameworkUsed: request.frameworkId || detectedFramework,
    rationale: "Generated via Anthropic Claude AI.",
    sourceLinks: sourceLinks.length > 0 ? sourceLinks : undefined,
    emailTemplate: emailTemplate,
    pressRelease: pressReleaseData || undefined
  };
};
