# Система борьбы с AI-кринжем / Anti-AI Cringe System

## 🎯 Проблема

AI-генерированный контент часто выдаёт себя характерными фразами и паттернами ("AI-isms"), которые делают текст неестественным и снижают доверие читателей.

**Главная проблема:** Специфические Unicode-символы, которые LLM используют по умолчанию (fancy quotes, em dashes, typographic ellipsis), мгновенно выдают AI-происхождение текста.

## ✅ Решение

ContentFactory использует многоуровневую систему для создания максимально человечного контента:

### 1. **🚫 Запрещённые Unicode-символы (КРИТИЧНО!)**

Система строго запрещает AI использовать типографские символы:

#### **Тире / Dashes:**
- ❌ `—` Em dash (U+2014)
- ❌ `–` En dash (U+2013)
- ❌ `‒` Figure dash (U+2012)
- ❌ `―` Horizontal bar (U+2015)
- ❌ `−` Minus sign (U+2212)
- ✅ **Использовать:** `-` (обычный дефис) или `--`

#### **Кавычки / Quotes:**
- ❌ `"` `"` Left/Right double quotes (U+201C/U+201D)
- ❌ `„` Low double quote (U+201E)
- ❌ `«` `»` Guillemets (U+00AB/U+00BB)
- ❌ `″` `‴` Prime symbols (U+2033/U+2034)
- ✅ **Использовать:** `"` (прямая кавычка)

#### **Апострофы / Apostrophes:**
- ❌ `'` `'` Left/Right single quotes (U+2018/U+2019)
- ❌ `‚` Low single quote (U+201A)
- ❌ `‹` `›` Single guillemets (U+2039/U+203A)
- ❌ `ʻ` `ʼ` Modifier apostrophes (U+02BB/U+02BC)
- ❌ `′` Prime (U+2032)
- ✅ **Использовать:** `'` (прямой апостроф)

#### **Многоточие / Ellipsis:**
- ❌ `…` Horizontal ellipsis (U+2026)
- ✅ **Использовать:** `...` (три отдельных точки)

#### **Буллеты / Bullets:**
- ❌ `•` Bullet (U+2022)
- ❌ `◦` White bullet (U+25E6)
- ❌ `⁃` Hyphen bullet (U+2043)
- ✅ **Использовать:** `-` или `*` для Markdown списков

#### **Вертикальные линии / Pipes:**
- ❌ `│` Box vertical (U+2502)
- ❌ `┃` Box vertical heavy (U+2503)
- ❌ `¦` Broken bar (U+00A6)
- ✅ **Использовать:** `|` (обычный pipe)

#### **Дроби / Slashes:**
- ❌ `⁄` Fraction slash (U+2044)
- ✅ **Использовать:** `/` (обычный слеш)

#### **Невидимые символы / Invisible Characters (НИКОГДА!):**
- ❌ U+00A0 Non-breaking space
- ❌ U+200B Zero-width space
- ❌ U+FEFF Byte order mark
- ❌ U+200C Zero-width non-joiner
- ❌ U+200D Zero-width joiner
- ❌ U+2060 Word joiner
- ❌ U+00AD Soft hyphen

### 2. **Запрещённые фразы (Banned Phrases)**

Система автоматически инструктирует AI избегать типичных клише:

**English:**
- ❌ "in the ever-evolving landscape"
- ❌ "delve into / delve deep"
- ❌ "testament to"
- ❌ "game-changer"
- ❌ "paradigm shift"
- ❌ "it's worth noting"
- ❌ "transformative journey"
- ❌ "unlock the power"
- ❌ "think outside the box"
- ❌ "holistic approach"

**Russian (Русский):**
- ❌ "в современном мире"
- ❌ "следует отметить"
- ❌ "важно подчеркнуть"
- ❌ "инновационное решение"
- ❌ "комплексный подход"
- ❌ "качественно новый уровень"

### 2. **Пунктуационные маркеры**

- ✅ Используем дефис (-) или двойной дефис (--)
- ❌ НИКОГДА не используем длинное тире (—) — это главный признак AI
- Умеренное использование восклицательных знаков
- Избегаем излишних многоточий (...)

### 3. **Структурные паттерны**

✅ **Делаем:**
- Смешиваем длину предложений агрессивно
- Используем фрагменты предложений. Вот так.
- Начинаем с "And" или "But" для естественности
- Добавляем скобки (как здесь)
- Используем сокращения (it's, you're, don't)

❌ **Избегаем:**
- Симметричных структур (всегда по 3 пункта)
- Открытий типа "Here are 5 ways..."
- Вопросов в конце типа "What's your take?"

### 4. **Маркеры подлинности**

✅ **Добавляем:**
- Конкретные цифры (не круглые: 47%, не 50%)
- Реальные названия мест, инструментов, людей
- Отраслевой жаргон где уместно
- Самоиронию когда подходит
- Иногда признаём неопределённость

### 5. **Мультиязычная поддержка**

Система адаптирует правила под язык:

#### 🇬🇧 English
- Естественные сокращения
- Варьирование ритма предложений
- Специфичные названия галерей, ярмарок, институций

#### 🇷🇺 Русский
- Избегаем канцелярита
- Используем разговорные обороты где уместно
- Добавляем междометия (ну, вот, короче)
- Неполные предложения для акцента

#### Другие языки
Система поддерживает: Français, Deutsch, Español, Italiano, 中文, 日本語

## 🔧 Как это работает

### В коде:

```typescript
// constants/antiAIcringe.ts

// Маппинг запрещённых Unicode-символов на ASCII-альтернативы
export const BANNED_UNICODE_CHARS: Record<string, Record<string, string>> = {
  dashes: {
    '\u2014': '-',     // Em dash (—) → hyphen
    '\u2013': '-',     // En dash (–) → hyphen
    // ... полный список
  },
  quotes: {
    '\u201C': '"',     // Left double quote (") → straight quote
    '\u201D': '"',     // Right double quote (") → straight quote
    // ... полный список
  },
  // ... другие категории
};

// Невидимые символы которые должны быть удалены
export const BANNED_INVISIBLE_CHARS = [
  '\u00A0',  // Non-breaking space
  '\u200B',  // Zero-width space
  // ... полный список
];

// Утилиты для проверки
export const detectAIUnicodeChars = (text: string): { 
  found: string[]; 
  clean: string 
} => {
  // Находит и заменяет все запрещённые символы
  // Возвращает: список найденных + очищенный текст
};

export const detectAICringePhrases = (
  text: string, 
  language: string = "English"
): string[] => {
  // Находит запрещённые AI-фразы в тексте
};
```

### В промптах:

```typescript
// services/deepseekService.ts
const outputLanguage = request.language || Language.ENGLISH;
const antiAIRules = getAntiAIPrompt(outputLanguage);

const prompt = `
OUTPUT LANGUAGE: ${outputLanguage}

2. FORBIDDEN UNICODE CHARACTERS (use ASCII alternatives):
   DASHES - Use only standard hyphen (-):
   - NEVER: — (em dash), – (en dash), ‒ ― −
   - ALWAYS: Use regular hyphen (-)
   
   QUOTES - Use only straight quotes (" and '):
   - NEVER: " " „ « » ″ ‴ (fancy double quotes)
   - NEVER: ' ' ‚ ‹ › ʻ ʼ ′ (fancy apostrophes)
   - ALWAYS: Use " for quotes and ' for apostrophes
   
   ... [полный список правил]

${antiAIRules}
`;
```

### Автоматическая проверка (опционально):

```typescript
import { detectAIUnicodeChars, detectAICringePhrases } from './constants/antiAIcringe';

// После генерации контента
const generatedText = await generateLinkedInPost(request);

// Проверка на Unicode-символы
const { found: unicodeIssues, clean: cleanText } = detectAIUnicodeChars(generatedText.content);
if (unicodeIssues.length > 0) {
  console.warn('AI Unicode detected:', unicodeIssues);
  // Автоматически использовать cleanText
}

// Проверка на AI-фразы
const cringeIssues = detectAICringePhrases(generatedText.content, request.language);
if (cringeIssues.length > 0) {
  console.warn('AI-cringe phrases detected:', cringeIssues);
  // Можно логировать для улучшения промптов
}
```

## 📊 Результат

### ❌ До (типичный AI):
> "In the ever-evolving landscape of contemporary art, it's worth noting that galleries are leveraging innovative solutions to unlock the power of digital transformation. This paradigm shift represents a game-changer for the industry."

### ✅ После (человечный текст):
> "Most galleries are still figuring out digital. The ones winning? They started small -- one artist's Instagram story at a time. No fancy strategy decks. Just consistent, authentic posts that collectors actually save."

## 🎨 Специфика для арт-мира

Дополнительные правила для галерейного контекста:

1. **Цены = деликатность**
   - ✅ "Available upon request"
   - ✅ "Private viewing to discuss"
   - ❌ "Starting at $50,000"

2. **Провенанс важен**
   - Всегда упоминаем институциональный контекст
   - Называем конкретные коллекции, резиденции

3. **Storytelling > Hard Selling**
   - Создаём желание через нарратив
   - Избегаем агрессивных CTA

## 🚀 Использование

### В UI:

1. Выберите язык в форме (Globe icon)
2. Система автоматически применит правила для выбранного языка
3. Все промпты включают антикринж-инструкции

### Для разработчиков:

```typescript
import { getAntiAIPrompt, BANNED_AI_PHRASES } from './constants/antiAIcringe';

// Получить правила для языка
const rules = getAntiAIPrompt('Russian');

// Проверить на запрещённые фразы (опционально, для валидации)
const hasCringe = BANNED_AI_PHRASES.some(phrase => 
  generatedText.toLowerCase().includes(phrase)
);
```

## 📝 Обновление правил

Чтобы добавить новые запрещённые фразы или символы:

1. Откройте [`constants/antiAIcringe.ts`](../constants/antiAIcringe.ts)

2. **Для добавления Unicode-символов:**
   ```typescript
   export const BANNED_UNICODE_CHARS: Record<string, Record<string, string>> = {
     // ... existing
     yourCategory: {
       '\uXXXX': 'replacement',  // Используйте Unicode escape
     }
   };
   ```

3. **Для добавления фраз:**
   - English: добавьте в `BANNED_AI_PHRASES`
   - Russian: добавьте в `BANNED_AI_PHRASES_RU`

4. **Обновите `ANTI_AI_GUIDELINES`** если нужно добавить новые правила в промпты

5. **Тестируйте:**
   ```bash
   npm run build
   ```

## 🧪 Тестирование Unicode-детекции

```typescript
import { detectAIUnicodeChars } from './constants/antiAIcringe';

// Пример: текст с em dash
const aiText = "Gallery opening — don't miss it!";
const { found, clean } = detectAIUnicodeChars(aiText);

console.log(found);  // ['— (dash)']
console.log(clean);  // "Gallery opening - don't miss it!"

// Пример: fancy quotes
const aiText2 = '"Contemporary art" is evolving…';
const result2 = detectAIUnicodeChars(aiText2);

console.log(result2.found);  // ['" (quote)', '" (quote)', '… (ellipsis)']
console.log(result2.clean);  // '"Contemporary art" is evolving...'
```

## 🎯 Best Practices

1. **Тестируйте на реальных примерах** - просите коллег оценить, видно ли AI
2. **Обновляйте список** - AI эволюционирует, появляются новые клише
3. **Баланс** - слишком неформальный текст тоже плох для некоторых аудиторий
4. **Контекст решает** - для пресс-релизов допустима большая формальность

## 📚 Ресурсы

- [OpenAI GPT Best Practices](https://platform.openai.com/docs/guides/prompt-engineering)
- [Anthropic Constitutional AI](https://www.anthropic.com/index/constitutional-ai-harmlessness-from-ai-feedback)
- [Writing That Doesn't Suck](https://medium.com/swlh/how-to-spot-ai-written-text-e1f0f8c6a0a0)

---

**Примечание:** Эта система постоянно улучшается. Если вы заметили новые AI-паттерны, добавьте их в `antiAIcringe.ts`!
