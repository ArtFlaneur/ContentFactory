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
  COMMENTS = "Comments",
  PRESS_RELEASES = "Press Releases",
  EXHIBITION_ANNOUNCEMENTS = "Exhibition Announcements",
  ARTIST_FEATURES = "Artist Features",
  COLLECTOR_COMMUNICATION = "Collector Communication",
  EVENT_INVITATIONS = "Event Invitations"
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

export enum Language {
  ENGLISH = "English",
  RUSSIAN = "Русский",
  FRENCH = "Français",
  GERMAN = "Deutsch",
  SPANISH = "Español",
  ITALIAN = "Italiano",
  CHINESE = "中文",
  JAPANESE = "日本語"
}

export interface PostRequest {
  audience: string;
  category: Category;
  topic: string;
  language?: Language; // Output language for generated content
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
  organizationInfo?: OrganizationInfo; // Organization details for official content
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

export interface OrganizationInfo {
  name: string;              // Gallery/Museum/Agency name
  description: string;       // About paragraph (boilerplate)
  website?: string;          // Organization website
  city: string;              // City for press releases
  country: string;           // Country for press releases
  contactName?: string;      // Media contact name
  contactEmail?: string;     // Media contact email
  contactPhone?: string;     // Media contact phone
}

export interface UserSettings {
  industry: string;
  role: string;
  country: string;
  city: string;
  targetAudiences: string[]; // User's specific audiences (up to 3)
  primaryPlatforms: ('linkedin' | 'twitter' | 'telegram' | 'instagram' | 'youtube')[];
  preferredTone: PostTone;
  preferredLanguage?: Language; // Preferred output language for content
  customCTAs: string[]; // User's specific CTAs (e.g. "Book a call", "Subscribe to newsletter")
  isPro?: boolean; // Optional flag for local state management before full backend
  organizationInfo?: OrganizationInfo; // Organization details for press releases and official content
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
  emailTemplate?: EmailTemplate;
  
  // Press Release specific fields
  pressRelease?: {
    headline: string;          // Main headline
    subheadline?: string;      // Optional subheadline
    releaseDate: string;       // "For Immediate Release" or specific date
    location: string;          // City, Country
    body: string;              // Main press release text (structured)
    boilerplate: string;       // About the gallery/organization
    mediaContact: {
      name: string;
      email: string;
      phone?: string;
    };
  };
}

export interface EmailTemplate {
  subject: string;
  greeting: string;
  body: string;
  signature: string;
}

export interface HistoryItem {
  id: string;
  createdAt: number; // epoch ms
  request: HistoryRequestSnapshot;
  post: GeneratedPost;
}

export type PostStatus = 'draft' | 'needs_review' | 'approved';

export type HistoryRequestSnapshot = Partial<PostRequest> & Pick<PostRequest, 'topic' | 'audience' | 'category'>;

export interface HistoryMetadata {
  status: PostStatus;
  note?: string;
}

export interface SharePayload {
  version: number;
  sharedAt: number;
  post: GeneratedPost;
  request?: HistoryRequestSnapshot;
  metadata?: HistoryMetadata;
}