export enum Audience {
  GALLERY_OWNERS = "Gallery Owners",
  FESTIVAL_DIRECTORS = "Festival Directors",
  CREATIVE_FOUNDERS = "Creative Founders/Strategists",
  ART_LOVERS = "Art Lovers"
}

export enum Category {
  HARSH_TRUTHS = "Harsh Truths",
  PERSONAL_JOURNEY = "Personal Journey",
  LEADERSHIP = "Leadership & Management",
  PROBLEM_SOLVING = "Problem Solving",
  GROWTH = "Growth & Development",
  CLIENT_RELATIONS = "Client Relations",
  INNOVATION = "Innovation & Change",
  PRODUCTIVITY = "Productivity & Systems",
  MONEY_VALUE = "Money & Value",
  RED_FLAGS = "Red Flags / Green Flags",
  NEWS = "News",
  COMMENTS = "Comments"
}

export enum PostGoal {
  ENGAGEMENT = "Engagement / Discussion",
  NEWSLETTER = "Newsletter Subscription",
  CONSULTATION = "Book a Consultation",
  EVENT = "Event Invitation",
  AUTHORITY = "Build Authority (No Ask)"
}

export enum PostTone {
  PROFESSIONAL = "Professional",
  RANT = "🔥 Rant / Critical",
  EMPATHIC = "🤝 Empathic / Supportive",
  ANALYTICAL = "🧠 Analytical / Data-Driven",
  STORYTELLER = "📖 Storyteller / Vulnerable"
}

export interface PostRequest {
  audience: string;
  category: Category;
  topic: string;
  frameworkId?: string; // Optional specific framework ID if the user wants to be specific
  includeNews?: boolean; // New flag for grounding
  sourceUrls?: string[]; // Optional: user-provided allowed sources (one URL per entry)
  platforms?: UserSettings['primaryPlatforms']; // Optional: used for per-platform character limits
  goal?: PostGoal;
  tone?: PostTone;
  userContext?: {
    industry: string;
    role: string;
    country?: string;
    city?: string;
    targetAudience: string;
  };
}

export interface SourceLink {
  title: string;
  url: string;
}

// --- SaaS / User Types ---

export interface UserProfile {
  id: string; // UUID from Auth provider
  email: string;
  isPro: boolean;
  generationCount: number;
  onboardingCompleted: boolean;
  settings: UserSettings;
}

export interface UserSettings {
  industry: string;
  role: string;
  country: string;
  city: string;
  targetAudiences: string[]; // User's specific audiences (up to 3)
  primaryPlatforms: ('linkedin' | 'twitter' | 'telegram' | 'instagram' | 'youtube')[];
  preferredTone: PostTone;
  customCTAs: string[]; // User's specific CTAs (e.g. "Book a call", "Subscribe to newsletter")
  isPro?: boolean; // Optional flag for local state management before full backend
}

export interface OnboardingStep {
  id: 'industry' | 'audience' | 'platforms' | 'review';
  title: string;
  description: string;
}

export interface GeneratedPost {
  title: string;
  content: string;
  shortContent?: string; // Content for X/Threads
  telegramContent?: string; // Content for Telegram
  instagramContent?: string; // Content for Instagram
  youtubeContent?: string; // Content for YouTube
  alternativeHooks?: string[]; // List of alternative opening lines
  frameworkUsed: string;
  rationale: string;
  sourceLinks?: SourceLink[]; // URLs from grounding
}