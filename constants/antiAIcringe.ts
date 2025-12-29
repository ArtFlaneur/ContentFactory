// Anti-AI Cringe System: Phrases and patterns that MUST be avoided
import { Language } from '../types';

const FALLBACK_LANGUAGE = 'English';

const LANGUAGE_ALIAS_MAP: Record<string, string> = {
  [Language.ENGLISH.toLowerCase()]: 'English',
  english: 'English',
  en: 'English',
  'en-us': 'English',
  'en-gb': 'English',
  [Language.RUSSIAN.toLowerCase()]: 'Russian',
  russian: 'Russian',
  ru: 'Russian',
  rus: 'Russian',
  'русский': 'Russian',
  [Language.FRENCH.toLowerCase()]: 'English',
  french: 'English',
  fr: 'English',
  [Language.GERMAN.toLowerCase()]: 'English',
  german: 'English',
  de: 'English',
  [Language.SPANISH.toLowerCase()]: 'English',
  spanish: 'English',
  es: 'English',
  [Language.ITALIAN.toLowerCase()]: 'English',
  italian: 'English',
  it: 'English',
  [Language.CHINESE.toLowerCase()]: 'English',
  chinese: 'English',
  zh: 'English',
  [Language.JAPANESE.toLowerCase()]: 'English',
  japanese: 'English',
  ja: 'English'
};

// Unicode characters that LLMs commonly generate (dead giveaways)
export const BANNED_UNICODE_CHARS: Record<string, Record<string, string>> = {
  dashes: {
    '\u2014': '-',     // Em dash (—) → hyphen
    '\u2013': '-',     // En dash (–) → hyphen
    '\u2012': '-',     // Figure dash (‒) → hyphen
    '\u2015': '-',     // Horizontal bar (―) → hyphen
    '\u2212': '-',     // Minus sign (−) → hyphen
  },
  quotes: {
    '\u201C': '"',     // Left double quote (") → straight quote
    '\u201D': '"',     // Right double quote (") → straight quote
    '\u201E': '"',     // Low double quote („) → straight quote
    '\u00AB': '"',     // Left guillemet («) → straight quote
    '\u00BB': '"',     // Right guillemet (») → straight quote
    '\u2033': '"',     // Double prime (″) → straight quote
    '\u2034': '"',     // Triple prime (‴) → straight quote
    '\u2018': "'",     // Left single quote (') → apostrophe
    '\u2019': "'",     // Right single quote (') → apostrophe
    '\u201A': "'",     // Low single quote (‚) → apostrophe
    '\u2039': "'",     // Left single guillemet (‹) → apostrophe
    '\u203A': "'",     // Right single guillemet (›) → apostrophe
    '\u02BB': "'",     // Modifier apostrophe (ʻ) → apostrophe
    '\u02BC': "'",     // Modifier apostrophe (ʼ) → apostrophe
    '\u2032': "'",     // Prime (′) → apostrophe
  },
  pipes: {
    '\u2502': '|',     // Box vertical (│) → pipe
    '\u2503': '|',     // Box vertical heavy (┃) → pipe
    '\u00A6': '|',     // Broken bar (¦) → pipe
  },
  ellipsis: {
    '\u2026': '...',   // Horizontal ellipsis (…) → three dots
  },
  bullets: {
    '\u2022': '-',     // Bullet (•) → hyphen for markdown lists
    '\u25E6': '-',     // White bullet (◦) → hyphen
    '\u2043': '-',     // Hyphen bullet (⁃) → hyphen
  },
  slashes: {
    '\u2044': '/',     // Fraction slash (⁄) → regular slash
  },
};

// Invisible/whitespace characters that should NEVER appear
export const BANNED_INVISIBLE_CHARS = [
  '\u00A0',  // Non-breaking space
  '\u200B',  // Zero-width space
  '\uFEFF',  // Byte order mark
  '\u200C',  // Zero-width non-joiner
  '\u200D',  // Zero-width joiner
  '\u2060',  // Word joiner
  '\u00AD',  // Soft hyphen
];

export const BANNED_AI_PHRASES = [
  // Overused AI clichés
  "in the ever-evolving landscape",
  "ever-evolving",
  "delve into",
  "delve deep",
  "dive deep",
  "testament to",
  "game-changer",
  "game changer",
  "paradigm shift",
  "at the end of the day",
  "it's worth noting",
  "it goes without saying",
  "needless to say",
  "let that sink in",
  "transformative journey",
  "unlock the power",
  "unlock your potential",
  "embark on a journey",
  "navigate the complexities",
  "in today's fast-paced world",
  "revolutionize the way",
  "cutting-edge",
  "leverage synergies",
  "circle back",
  "touch base",
  "low-hanging fruit",
  "move the needle",
  "robust solution",
  "seamless integration",
  "holistic approach",
  "best-in-class",
  "world-class",
  "innovative solutions",
  "think outside the box",
  "push the envelope",
  "take it to the next level",
  "elevate your",
  "next level",
  "crystal clear",
  "meticulously crafted",
  "tapestry of",
  "realm of",
  "landscape of",
  "intricate dance",
  "symphony of",
  "testament to the power",
  "beacon of",
  "cornerstone of",
  "it's important to note",
  "it's crucial to understand",
  "comprehensive guide",
  "ultimate guide",
  "definitive guide",
];

// Language-specific banned phrases
export const BANNED_AI_PHRASES_RU = [
  "в современном мире",
  "в наше время",
  "не секрет что",
  "общеизвестно что",
  "как известно",
  "нельзя не отметить",
  "следует отметить",
  "важно подчеркнуть",
  "особо стоит выделить",
  "инновационное решение",
  "прорывные технологии",
  "революционный подход",
  "качественно новый уровень",
  "комплексный подход",
  "системное решение",
  "эффективное взаимодействие",
  "оптимизация процессов",
  "синергетический эффект",
  "многогранный процесс",
  "глубинные механизмы",
  "тщательно продуманный",
];

export const AI_CRINGE_PATTERNS = [
  // Patterns to avoid (regex-ready)
  /\b(very|really|extremely|incredibly|absolutely)\s+(amazing|powerful|important|crucial|essential)\b/gi,
  /\b(unlock|unleash|harness)\s+the\s+power\b/gi,
  /\b(cutting[\s-]edge|state[\s-]of[\s-]the[\s-]art|best[\s-]in[\s-]class)\b/gi,
  /\b(seamless|robust|holistic|comprehensive|transformative)\b/gi,
  /\btake\s+your\s+\w+\s+to\s+the\s+next\s+level\b/gi,
];

export const ANTI_AI_GUIDELINES = `
ANTI-AI WRITING RULES (STRICT ENFORCEMENT):

1. BANNED PHRASES: Never use any of these AI clichés:
   - "ever-evolving", "delve into", "testament to", "game-changer"
   - "paradigm shift", "it's worth noting", "needless to say"
   - "transformative journey", "unlock the power", "cutting-edge"
   - "leverage synergies", "holistic approach", "world-class"
   - "think outside the box", "push the envelope", "next level"

2. FORBIDDEN UNICODE CHARACTERS (use ASCII alternatives):
   DASHES - Use only standard hyphen (-):
   - NEVER: — (em dash), – (en dash), ‒ (figure dash), ― (horizontal bar), − (minus sign)
   - ALWAYS: Use regular hyphen (-) or double hyphen (--)
   
   QUOTES - Use only straight quotes (" and '):
   - NEVER: " " „ « » ″ ‴ (fancy double quotes)
   - NEVER: ' ' ‚ ‹ › ʻ ʼ ′ (fancy single quotes/apostrophes)
   - ALWAYS: Use " for quotes and ' for apostrophes
   
   ELLIPSIS - Use three periods:
   - NEVER: … (ellipsis character U+2026)
   - ALWAYS: ... (three separate periods)
   
   BULLETS - Use hyphens for lists:
   - NEVER: • ◦ ⁃ (bullet characters)
   - ALWAYS: - (hyphen) or * (asterisk) for Markdown lists
   
   PIPES - Use standard pipe:
   - NEVER: │ ┃ ¦ (box drawing or broken bar)
   - ALWAYS: | (standard pipe)
   
   INVISIBLE CHARACTERS - NEVER use:
   - No non-breaking spaces, zero-width spaces, byte order marks
   - No zero-width joiners/non-joiners, word joiners, soft hyphens

3. STRUCTURE TELLS:
   - NO "listicle" openings like "Here are 5 ways..."
   - NO "numbered insights" unless the framework requires it
   - Avoid symmetrical structures (e.g., always 3-part frameworks)
   - Mix sentence lengths aggressively

4. VOCABULARY:
   - Use contractions (it's, you're, don't)
   - Include industry slang when appropriate
   - Drop articles occasionally for impact
   - Use fragments. Like this.

5. AUTHENTICITY MARKERS:
   - Include specific numbers (not round figures)
   - Name real places, tools, people
   - Add small imperfections (start sentence with "And" or "But")
   - Use parentheticals (like this one)

6. FORBIDDEN PATTERNS:
   - "In today's/this fast-paced world"
   - "It's no secret that..."
   - "The key to success is..."
   - Starting with "Imagine this..."
   - Ending with "What's your take?"

7. HUMAN TOUCHES:
   - Occasional typo-like informality ("gonna", "wanna" in casual tones)
   - Cultural references
   - Self-deprecating humor when appropriate
   - Contrarian takes
   - Admit uncertainty sometimes

8. TONE CALIBRATION:
   - Professional ≠ Corporate jargon
   - Vulnerable ≠ Oversharing
   - Analytical ≠ Robotic
   - Critical ≠ Mean-spirited

CRITICAL: Use only standard ASCII punctuation. Fancy Unicode characters are instant AI tells.
`;

export const LANGUAGE_SPECIFIC_GUIDELINES: Record<string, string> = {
  Russian: `
RUSSIAN ANTI-AI RULES:

1. ЗАПРЕЩЕННЫЕ UNICODE-СИМВОЛЫ (используйте ASCII):
   ТИРЕ - Только обычный дефис (-):
   - НИКОГДА: — (длинное тире), – (короткое тире), ‒ ― −
   - ВСЕГДА: Обычный дефис (-) или двойной (--)
   
   КАВЫЧКИ - Только прямые кавычки (" и '):
   - НИКОГДА: « » „ " " (типографские кавычки)
   - НИКОГДА: ' ' ‚ ‹ › (типографские апострофы)
   - ВСЕГДА: " для кавычек и ' для апострофа
   
   МНОГОТОЧИЕ:
   - НИКОГДА: … (символ многоточия)
   - ВСЕГДА: ... (три точки)

2. Избегайте канцелярита:
   - НЕТ: "в современном мире", "следует отметить", "важно подчеркнуть"
   - ДА: Прямая речь, конкретика, живой язык

3. Естественность:
   - Используйте разговорные обороты где уместно
   - Добавляйте междометия (ну, вот, короче)
   - Неполные предложения для акцента

4. Специфика для арт-мира:
   - Используйте профессиональный жаргон галеристов
   - Называйте конкретные музеи, ярмарки, галереи
   - Упоминайте реальных художников и кураторов

5. Запрещенные клише:
   - "инновационное решение", "прорывные технологии"
   - "комплексный подход", "системное решение"
   - "качественно новый уровень", "эффективное взаимодействие"

КРИТИЧНО: Используйте только стандартную ASCII-пунктуацию. Типографские символы - мгновенная выдача ИИ.
  `,
  English: `
ENGLISH ANTI-AI RULES:

1. FORBIDDEN UNICODE (already covered in main guidelines - strictly enforce)

2. Voice authenticity:
   - Use contractions naturally
   - Vary sentence rhythm deliberately
   - Include occasional sentence fragments

3. Art world specificity:
   - Name actual galleries, fairs, institutions
   - Use insider terminology
   - Reference real artists, curators, collectors

4. Avoid corporate speak:
   - Replace jargon with plain talk
   - Choose concrete over abstract
   - Prefer active voice

CRITICAL: Only ASCII punctuation. No fancy Unicode.
  `,
};

export const getAntiAIPrompt = (language: string = Language.ENGLISH): string => {
  const baseGuidelines = ANTI_AI_GUIDELINES;
  const normalized = (language || '').trim().toLowerCase();
  const canonical = LANGUAGE_ALIAS_MAP[normalized] || FALLBACK_LANGUAGE;
  const languageGuidelines = LANGUAGE_SPECIFIC_GUIDELINES[canonical] || LANGUAGE_SPECIFIC_GUIDELINES[FALLBACK_LANGUAGE];

  return `${baseGuidelines}\n\n${languageGuidelines}`;
};

// Utility function to detect banned Unicode characters in text
export const detectAIUnicodeChars = (text: string): { found: string[]; clean: string } => {
  const found: string[] = [];
  let clean = text;

  // Check and replace dashes
  Object.entries(BANNED_UNICODE_CHARS.dashes).forEach(([char, replacement]) => {
    if (text.includes(char)) {
      found.push(`${char} (dash)`);
      clean = clean.replace(new RegExp(char, 'g'), replacement);
    }
  });

  // Check and replace quotes
  Object.entries(BANNED_UNICODE_CHARS.quotes).forEach(([char, replacement]) => {
    if (text.includes(char)) {
      found.push(`${char} (quote)`);
      clean = clean.replace(new RegExp(char, 'g'), replacement);
    }
  });

  // Check and replace pipes
  Object.entries(BANNED_UNICODE_CHARS.pipes).forEach(([char, replacement]) => {
    if (text.includes(char)) {
      found.push(`${char} (pipe)`);
      clean = clean.replace(new RegExp(char, 'g'), replacement);
    }
  });

  // Check and replace ellipsis
  Object.entries(BANNED_UNICODE_CHARS.ellipsis).forEach(([char, replacement]) => {
    if (text.includes(char)) {
      found.push(`${char} (ellipsis)`);
      clean = clean.replace(new RegExp(char, 'g'), replacement);
    }
  });

  // Check and replace bullets
  Object.entries(BANNED_UNICODE_CHARS.bullets).forEach(([char, replacement]) => {
    if (text.includes(char)) {
      found.push(`${char} (bullet)`);
      clean = clean.replace(new RegExp(char, 'g'), replacement);
    }
  });

  // Check and replace slashes
  Object.entries(BANNED_UNICODE_CHARS.slashes).forEach(([char, replacement]) => {
    if (text.includes(char)) {
      found.push(`${char} (slash)`);
      clean = clean.replace(new RegExp(char, 'g'), replacement);
    }
  });

  // Check for invisible characters
  BANNED_INVISIBLE_CHARS.forEach(char => {
    if (text.includes(char)) {
      found.push(`U+${char.charCodeAt(0).toString(16).toUpperCase().padStart(4, '0')} (invisible)`);
      clean = clean.replace(new RegExp(char, 'g'), '');
    }
  });

  return { found, clean };
};

// Utility function to check if text contains AI-cringe phrases
export const detectAICringePhrases = (text: string, language: string = "English"): string[] => {
  const lowerText = text.toLowerCase();
  const found: string[] = [];

  // Check English phrases
  BANNED_AI_PHRASES.forEach(phrase => {
    if (lowerText.includes(phrase.toLowerCase())) {
      found.push(phrase);
    }
  });

  // Check Russian phrases if applicable
  if (language === "Russian" || language === "Русский") {
    BANNED_AI_PHRASES_RU.forEach(phrase => {
      if (lowerText.includes(phrase.toLowerCase())) {
        found.push(phrase);
      }
    });
  }

  return [...new Set(found)]; // Remove duplicates
};
