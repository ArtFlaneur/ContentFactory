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
  NEWS = "News"
}

export interface PostRequest {
  audience: Audience;
  category: Category;
  topic: string;
  frameworkId?: string; // Optional specific framework ID if the user wants to be specific
  includeNews: boolean; // New flag for grounding
}

export interface SourceLink {
  title: string;
  url: string;
}

export interface GeneratedPost {
  title: string;
  content: string;
  shortContent?: string; // Content for X/Threads
  frameworkUsed: string;
  rationale: string;
  sourceLinks?: SourceLink[]; // URLs from grounding
}