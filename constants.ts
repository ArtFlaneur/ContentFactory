import { Audience, Category, PostGoal, PostTone, Language } from "./types";

export const AUDIENCE_OPTIONS = Object.values(Audience);
export const CATEGORY_OPTIONS = Object.values(Category);
export const GOAL_OPTIONS = Object.values(PostGoal);
export const TONE_OPTIONS = Object.values(PostTone);
export const LANGUAGE_OPTIONS = Object.values(Language);

export const TRUSTED_ART_NEWS_SOURCES = [
  {
    id: 'artnews',
    label: 'ARTnews Breaking',
    url: 'https://www.artnews.com/category/news/',
    description: 'Daily institutional and market coverage from the ARTnews editorial desk.'
  },
  {
    id: 'artnet',
    label: 'Artnet News Pro (Market)',
    url: 'https://news.artnet.com/market',
    description: 'Primary and secondary market intel, auction data, and fair analysis.'
  },
  {
    id: 'artnewspaper',
    label: 'The Art Newspaper',
    url: 'https://www.theartnewspaper.com/',
    description: 'Global museum, policy, and restitution reporting with on-the-ground journalists.'
  },
  {
    id: 'artforum',
    label: 'Artforum News & Critics Picks',
    url: 'https://www.artforum.com/news',
    description: 'Critic-driven exhibition coverage and curatorial appointments.'
  },
  {
    id: 'artbasel',
    label: 'Art Basel Stories',
    url: 'https://www.artbasel.com/stories',
    description: 'Official dispatches from Art Basel fairs, market trend explainers, and VIP insights.'
  }
];

export interface FrameworkDefinition {
  id: string;
  name: string;
  description: string;
}

export const FRAMEWORKS: Record<string, FrameworkDefinition[]> = {
  [Category.HARSH_TRUTHS]: [
    { id: "Framework 1", name: "5 Harsh Truths", description: "List 5 hard-to-swallow realities." },
    { id: "Framework 2", name: "Perception vs Reality", description: "What people think vs reality." },
    { id: "Framework 3", name: "Brutal Life Lessons", description: "Lessons from industry mistakes." },
    { id: "Framework 4", name: "Counterintuitive Rookie Mistakes", description: "Mistake -> Why wrong -> Better way." },
    { id: "Framework 5", name: "Stereotypes That Are True", description: "Stereotype -> Reality -> Relevance." },
    { id: "Framework 6", name: "List of Free Resources", description: "Value-packed list of tools." },
    { id: "Framework 7", name: "What I Wish I Knew", description: "List of retrospectives." },
    { id: "Framework 8", name: "Career Traps", description: "Trap -> Cost -> Escape." }
  ],
  [Category.PERSONAL_JOURNEY]: [
    { id: "Framework 9", name: "The Day That Changed Everything", description: "Before -> Moment -> After." },
    { id: "Framework 10", name: "3 Unconventional Choices", description: "Choice -> Why -> Result." },
    { id: "Framework 11", name: "Decade of Lessons", description: "Used to think X -> Now know Y." },
    { id: "Framework 12", name: "Biggest Failure", description: "Failure -> Cost -> Lesson." },
    { id: "Framework 13", name: "Role Transition", description: "Polished vs untold story." },
    { id: "Framework 14", name: "Myths I Believed", description: "Myth -> Reality -> Evidence." },
    { id: "Framework 15", name: "The Expensive Mistake", description: "Price paid -> Learning." },
    { id: "Framework 16", name: "Walking Away", description: "Offer -> Why no -> Aftermath." }
  ],
  [Category.LEADERSHIP]: [
    { id: "Framework 17", name: "Hardest Decision", description: "Situation -> Cost -> Payoff." },
    { id: "Framework 18", name: "What Great Leaders Never Say", description: "X -> What they say instead." },
    { id: "Framework 19", name: "Hiring/Leadership Mistake", description: "Mistake -> Lesson -> Change." },
    { id: "Framework 20", name: "Simple Habits", description: "Habit -> Why -> Result." },
    { id: "Framework 21", name: "Building Trust", description: "Don't do X -> Do Y." },
    { id: "Framework 22", name: "Silent Killers of Morale", description: "Killer -> Why -> Fix." }
  ],
  [Category.PROBLEM_SOLVING]: [
    { id: "Framework 23", name: "How We Solved It", description: "Problem -> Failure -> Solution." },
    { id: "Framework 24", name: "The Problem Nobody Talks About", description: "Visible vs Real problem." },
    { id: "Framework 25", name: "Warning Signs", description: "Sign -> Why it's a warning." },
    { id: "Framework 26", name: "Real Reason Projects Fail", description: "Surface -> Root -> Pattern." },
    { id: "Framework 27", name: "Quick Fixes", description: "Fix -> Why it works." },
    { id: "Framework 28", name: "The Framework Change", description: "Old way -> New way -> Proof." },
    { id: "Framework 29", name: "Problems Leaders Pretend Don't Exist", description: "Problem -> Pretense -> Reality." },
    { id: "Framework 30", name: "Solution Right In Front of Us", description: "Complex attempts -> Simple solution." }
  ],
  [Category.GROWTH]: [
    { id: "Framework 31", name: "Skills That Matter More", description: "Non-obvious skills." },
    { id: "Framework 32", name: "Truth About Certifications", description: "Promise vs Reality." },
    { id: "Framework 33", name: "What Matters in Interviews", description: "Generic vs Real questions." },
    { id: "Framework 34", name: "Career Paths Nobody Tells You", description: "Path -> Why -> Timeline." },
    { id: "Framework 35", name: "Skills That Got Me Promoted", description: "Assumed vs Actual skill." },
    { id: "Framework 36", name: "Junior to Senior", description: "Turning point -> Mindset shift." },
    { id: "Framework 37", name: "Valuable Side-Skills", description: "Skill -> Value creation." },
    { id: "Framework 38", name: "Why Experts Fail", description: "Pattern -> Counter-measure." }
  ],
  [Category.CLIENT_RELATIONS]: [
    { id: "Framework 40", name: "What Clients Actually Want", description: "Don't want X -> Do want Y." },
    { id: "Framework 41", name: "Red Flags", description: "Phrase -> Meaning -> Action." },
    { id: "Framework 42", name: "Winning Without Cold Calling", description: "Strategy -> ROI." },
    { id: "Framework 43", name: "Perfect Onboarding", description: "Day 1 -> Week 1 -> Month 1." },
    { id: "Framework 44", name: "Why Clients Leave", description: "Broken promises pattern." },
    { id: "Framework 45", name: "Feedback That Changed Everything", description: "Feedback -> Action." },
    { id: "Framework 46", name: "The Meeting That Changed Everything", description: "Question -> Answer -> Shift." },
    { id: "Framework 47", name: "How to Say No", description: "Bad way vs Good way." },
    { id: "Framework 48", name: "Lost Deal Patterns", description: "Reason given vs Real reason." }
  ],
  [Category.INNOVATION]: [
    { id: "Framework 49", name: "Innovation Nobody Saw Coming", description: "Focus A vs Focus B." },
    { id: "Framework 50", name: "Disruption Reality", description: "Assumption vs Reality." },
    { id: "Framework 51", name: "Unexpected Future", description: "Prediction A vs Reality B." },
    { id: "Framework 52", name: "Small Changes, Big Results", description: "Small tweak -> Impact." },
    { id: "Framework 53", name: "Surprise Experiment", description: "Hypothesis -> Result." },
    { id: "Framework 54", name: "Tomorrow's Leaders", description: "Today vs Tomorrow." },
    { id: "Framework 55", name: "Quiet Revolution", description: "Headlines vs Reality." }
  ],
  [Category.PRODUCTIVITY]: [
    { id: "Framework 56", name: "Morning Routine", description: "Standard vs Effective." },
    { id: "Framework 57", name: "Systems That Scale", description: "Scaling rules." },
    { id: "Framework 58", name: "Productivity Hack", description: "Problem -> Hack -> Result." },
    { id: "Framework 59", name: "Why Workflows Fail", description: "Surface vs Real reason." },
    { id: "Framework 60", name: "Metrics That Matter", description: "Vanity vs Real metrics." },
    { id: "Framework 61", name: "Automate 80%", description: "Old -> New -> Result." },
    { id: "Framework 62", name: "Tools Worth Paying For", description: "Paid vs Skip." }
  ],
  [Category.MONEY_VALUE]: [
    { id: "Framework 63", name: "Real Cost of Success", description: "Visible vs Hidden cost." },
    { id: "Framework 64", name: "Real Profit Margins", description: "Paper vs Real numbers." },
    { id: "Framework 65", name: "Hidden Costs", description: "Visible vs Hidden." },
    { id: "Framework 66", name: "How We 2x'd Revenue", description: "Assumption vs Reality." },
    { id: "Framework 67", name: "Pricing Secrets", description: "Secret -> Psychology." },
    { id: "Framework 68", name: "Money Mindset Shift", description: "Old -> New -> Result." }
  ],
  [Category.RED_FLAGS]: [
    { id: "Framework 69", name: "Red/Green Flags Joining Org", description: "List of flags." }
  ],
  [Category.NEWS]: [
    { id: "Framework 70", name: "TOP-3 News", description: "3 news items from the past 24 hours." }
  ],
  [Category.COMMENTS]: [],
  [Category.PRESS_RELEASES]: [
    { id: "Framework 71", name: "Exhibition Opening Press Release", description: "Who -> What -> Where/When -> Why it matters -> Artist quote -> Gallery statement -> Viewing details." },
    { id: "Framework 72", name: "Artist Representation Announcement", description: "Gallery proud to announce -> Artist background -> Career highlights -> Why this partnership -> First exhibition details." },
    { id: "Framework 73", name: "Award/Recognition Press Release", description: "Achievement -> Context/significance -> Artist/gallery statement -> Career impact -> Next steps." },
    { id: "Framework 74", name: "Acquisition/Sale Announcement", description: "Work acquired by [institution] -> Artwork details -> Historical significance -> Curator quote -> Gallery role." },
    { id: "Framework 75", name: "Fair Participation Announcement", description: "Gallery presenting at [fair] -> Featured artists -> Booth location -> Highlight works -> VIP preview details." },
    { id: "Framework 76", name: "Exhibition Extension/Closing", description: "Due to demand -> Extended until -> Exhibition highlights -> Final viewing opportunity -> Call to action." }
  ],
  [Category.EXHIBITION_ANNOUNCEMENTS]: [
    { id: "Framework 77", name: "Opening Night Invitation", description: "Teaser hook -> Key works -> Artist presence -> Date/time/location -> RSVP urgency." },
    { id: "Framework 78", name: "Last Chance to See", description: "Closing soon alert -> Exhibition highlights -> Visitor testimonials -> Final days -> Call to visit." },
    { id: "Framework 79", name: "Mid-Show Momentum", description: "X days remaining -> Critical acclaim -> Works still available -> Behind-the-scenes moment -> Visit prompt." },
    { id: "Framework 80", name: "Thematic Deep Dive", description: "Exhibition theme -> Lead artwork analysis -> Artist intention -> Curatorial thread -> Visit invitation." },
    { id: "Framework 81", name: "Installation Teaser", description: "Behind-the-scenes setup -> Scale/ambition reveal -> Artist at work -> Opening date -> Anticipation build." },
    { id: "Framework 82", name: "Exhibition Series Announcement", description: "Multi-show concept -> Season overview -> First exhibition focus -> Artist lineup -> Season pass/membership." }
  ],
  [Category.ARTIST_FEATURES]: [
    { id: "Framework 83", name: "Artist Spotlight Deep Dive", description: "Artist background -> Practice philosophy -> Current work focus -> Process insights -> Where to see work." },
    { id: "Framework 84", name: "Studio Visit Story", description: "Arrival moment -> Creative space details -> Work in progress -> Artist quote -> Upcoming opportunities." },
    { id: "Framework 85", name: "Artwork Spotlight", description: "Visual hook -> Title/medium/dimensions -> Artist's intention -> Technical details -> Availability/inquiry." },
    { id: "Framework 86", name: "Artist Career Milestone", description: "Recent achievement -> Career trajectory -> What makes them relevant now -> Next chapter -> Gallery relationship." },
    { id: "Framework 87", name: "Process & Technique Feature", description: "Technique introduction -> Why artist uses it -> Materials/process -> Result on viewer -> Example work." },
    { id: "Framework 88", name: "Artist Interview Excerpt", description: "Provocative question -> Artist's surprising answer -> Context/background -> Deeper insight -> Connection to current work." },
    { id: "Framework 89", name: "Historical Context Positioning", description: "Art historical movement -> Artist's contemporary take -> What's different now -> Critical reception -> Why it matters." }
  ],
  [Category.COLLECTOR_COMMUNICATION]: [
    { id: "Framework 90", name: "New Work Available", description: "Just arrived -> Artist background (brief) -> Work details -> Why now matters -> Private viewing offer." },
    { id: "Framework 91", name: "Investment Perspective", description: "Artist market trajectory -> Recent sales/placements -> Critical momentum -> Current opportunity -> Discreet inquiry." },
    { id: "Framework 92", name: "Collection Building Insight", description: "Theme/movement focus -> Why it's timely -> Key artists -> Strategic approach -> Consultation offer." },
    { id: "Framework 93", name: "Fair/Biennale Insider Tip", description: "Event overview -> What to watch -> Gallery highlights -> Undervalued opportunity -> Private viewing arrangement." },
    { id: "Framework 94", name: "Sold Work Announcement", description: "Work placed -> Collection significance -> Artist momentum -> Similar available works -> Waitlist/commission option." },
    { id: "Framework 95", name: "Exclusive Preview Invitation", description: "Private viewing before public -> Featured works -> Artist attendance -> Date/time -> RSVP exclusivity." },
    { id: "Framework 96", name: "Commission Opportunity", description: "Artist accepting commissions -> Recent commission example -> Process/timeline -> Investment range -> Expression of interest." }
  ],
  [Category.EVENT_INVITATIONS]: [
    { id: "Framework 97", name: "VIP Opening Reception", description: "Exclusive first look -> Exhibition preview -> Artist meet-and-greet -> Curated experience -> RSVP details." },
    { id: "Framework 98", name: "Artist Talk/Panel", description: "Topic/theme -> Speaker lineup -> What to expect -> Audience benefit -> Registration/seating." },
    { id: "Framework 99", name: "Curator Walkthrough", description: "Exhibition context -> Curatorial vision -> Key insights to share -> Intimate group -> Booking required." },
    { id: "Framework 100", name: "Workshop/Masterclass", description: "Skill/technique focus -> Artist/instructor -> What participants create -> Materials included -> Limited spots." },
    { id: "Framework 101", name: "Collectors' Dinner", description: "Occasion/milestone -> Intimate gathering -> Artist presence -> Venue/menu teaser -> Exclusive invitation." },
    { id: "Framework 102", name: "Portfolio Review/Studio Visit", description: "Opportunity description -> Who should attend -> What to bring -> Booking slots -> Selection criteria." },
    { id: "Framework 103", name: "Collaboration Event", description: "Partner announcement -> Cross-disciplinary angle -> Unique experience -> Cultural relevance -> RSVP urgency." }
  ]
};

// This context string contains the essence of the user's provided frameworks to ground the AI
export const SYSTEM_CONTEXT = `
You are an expert LinkedIn ghostwriter for the Cultural Systems & Art Tech sector (e.g., Art Flaneur, Gallery Operations, Festival Management).
Your Tone of Voice is: Professional yet raw, authoritative but vulnerable, data-driven but human-centric. You avoid corporate jargon. You speak truth to power in the art world.

You have access to specific "Frameworks" that you must use to structure your posts.

Here are the definitions of the Categories and their associated Framework styles:

CATEGORY 1: HARSH TRUTHS
- Framework 1: 5 Harsh Truths. Structure: List 5 hard-to-swallow realities about the specific topic.
- Framework 2: Perception vs Reality. Structure: "What people think [Role] do vs what they really do."
- Framework 3: Brutal Life Lessons. Structure: Lessons learned from years in the industry (mistakes -> lessons).
- Framework 4: Counterintuitive Rookie Mistakes. Structure: Mistake -> Why it's wrong -> The Better way.
- Framework 5: Stereotypes That Are True. Structure: Stereotype -> Reality -> Why it matters.
- Framework 6: List of Free Resources. Structure: Value-packed list of tools.
- Framework 7: What I Wish I Knew. Structure: List of retrospectives.
- Framework 8: Career Traps. Structure: Trap -> Cost -> Escape.

CATEGORY 2: PERSONAL JOURNEY
- Framework 9: The Day That Changed Everything. Structure: Before -> The Moment -> After -> Result.
- Framework 10: 3 Unconventional Choices. Structure: Choice -> Why it seemed wrong -> Result -> Lesson.
- Framework 11: Decade of Lessons. Structure: "I used to think X, now I know Y."
- Framework 12: Biggest Failure. Structure: The Failure -> Cost -> What we got wrong -> The Lesson -> Proof it worked.
- Framework 13: Role Transition. Structure: The polished story vs the untold story.
- Framework 14: Myths I Believed. Structure: Myth -> Reality -> Evidence -> Consequence.
- Framework 15: The Expensive Mistake. Structure: Price paid -> What I got wrong -> Learning.
- Framework 16: Walking Away. Structure: The Offer -> Why it looked good -> Why I said no -> Aftermath.

CATEGORY 3: LEADERSHIP & MANAGEMENT
- Framework 17: Hardest Decision. Structure: Situation -> Wanted to do -> Did -> Cost -> Payoff.
- Framework 18: What Great Leaders Never Say. Structure: "X" -> What they say instead.
- Framework 19: Hiring/Leadership Mistake. Structure: Mistake -> Lesson -> What changed.
- Framework 20: Simple Habits. Structure: Habit -> Why it works -> Result.
- Framework 21: Building Trust. Structure: Don't do X -> Do Y.
- Framework 22: Silent Killers of Morale. Structure: Killer -> Why it kills -> Fix.

CATEGORY 4: PROBLEM SOLVING
- Framework 23: How We Solved It. Structure: Problem -> Why it mattered -> Failed attempt -> Real solution -> Result.
- Framework 24: The Problem Nobody Talks About. Structure: Visible problem vs Real problem -> Impact -> Fix.
- Framework 25: Warning Signs. Structure: Sign -> Why it's a warning.
- Framework 26: Real Reason Projects Fail. Structure: Surface reason -> Root reason -> Pattern.
- Framework 27: Quick Fixes. Structure: Fix -> Why it works -> Time to implement.
- Framework 28: The Framework Change. Structure: Old way -> New way -> Proof.
- Framework 29: Problems Leaders Pretend Don't Exist. Structure: Problem -> What leaders pretend -> Reality.
- Framework 30: Solution Right In Front of Us. Structure: Complex attempts -> Simple solution -> Lesson.

CATEGORY 5: GROWTH & DEVELOPMENT
- Framework 31: Skills That Matter More. Structure: Non-obvious skills (e.g., listening, simplifying).
- Framework 32: Truth About Certifications. Structure: Promise vs Reality.
- Framework 33: What Matters in Interviews. Structure: Generic questions vs Real questions.
- Framework 34: Career Paths Nobody Tells You. Structure: Path -> Why -> Timeline.
- Framework 35: Skills That Got Me Promoted. Structure: Assumed skill vs Actual skill.
- Framework 36: Junior to Senior. Structure: Turning point -> Mindset shift.
- Framework 37: Valuable Side-Skills. Structure: Skill -> Why it creates value.
- Framework 38: Why Experts Fail. Structure: Pattern -> Counter-measure.

CATEGORY 6: CLIENT RELATIONS
- Framework 40: What Clients Actually Want. Structure: Don't want X -> Do want Y.
- Framework 41: Red Flags. Structure: Phrase -> What it means -> What to do.
- Framework 42: Winning Without Cold Calling. Structure: Strategy -> Why it works -> ROI.
- Framework 43: Perfect Onboarding. Structure: Day 1 -> Week 1 -> Month 1 steps.
- Framework 44: Why Clients Leave. Structure: Small broken promises pattern.
- Framework 45: Feedback That Changed Everything. Structure: Feedback -> Interpretation -> Action.
- Framework 46: The Meeting That Changed Everything. Structure: Question asked -> Surprising answer -> Shift.
- Framework 47: How to Say No. Structure: Bad way vs Good way.
- Framework 48: Lost Deal Patterns. Structure: Reason given vs Real reason -> Fix.

CATEGORY 7: INNOVATION & CHANGE
- Framework 49: Innovation Nobody Saw Coming. Structure: Focus A vs Focus B -> Result.
- Framework 50: Disruption Reality. Structure: Assumption vs Reality -> Early signs.
- Framework 51: Unexpected Future. Structure: Prediction A vs Reality B.
- Framework 52: Small Changes, Big Results. Structure: Small tweak -> Impact.
- Framework 53: Surprise Experiment. Structure: Hypothesis -> Result -> Insight.
- Framework 54: Tomorrow's Leaders. Structure: Today vs Tomorrow comparison.
- Framework 55: Quiet Revolution. Structure: Headlines vs Reality -> Who is winning.

CATEGORY 8: PRODUCTIVITY & SYSTEMS
- Framework 56: Morning Routine. Structure: Standard vs Effective routine.
- Framework 57: Systems That Scale. Structure: Doesn't scale vs Scales -> Rule.
- Framework 58: Productivity Hack. Structure: Problem -> Hack -> Result.
- Framework 59: Why Workflows Fail. Structure: Surface reason -> Real reason -> Debug.
- Framework 60: Metrics That Matter. Structure: Vanity metrics vs Real metrics.
- Framework 61: Automate 80%. Structure: Old way -> New way -> Result.
- Framework 62: Tools Worth Paying For. Structure: Paid vs Skip -> Pattern.

CATEGORY 9: MONEY & VALUE
- Framework 63: Real Cost of Success. Structure: Visible success vs Hidden cost.
- Framework 64: Real Profit Margins. Structure: Paper numbers vs Real numbers -> Solution.
- Framework 65: Hidden Costs. Structure: Visible vs Hidden -> Impact.
- Framework 66: How We 2x'd Revenue. Structure: Assumption (volume) vs Reality (margin/pricing).
- Framework 67: Pricing Secrets. Structure: Secret -> Psychology.
- Framework 68: Money Mindset Shift. Structure: Old mindset -> New mindset -> Result.

CATEGORY 10: RED FLAGS / GREEN FLAGS
- Framework 69: Red/Green Flags Joining Org. Structure: List of Red flags vs Green flags.

CATEGORY 11: NEWS
- Framework 70: TOP-3 News. Structure: 3 news items from the past 24 hours. Input: 3 links. Output: Short accompaniment for each news item + link.

CATEGORY 12: PRESS RELEASES
- Framework 71: Exhibition Opening Press Release. Structure: Who (gallery) -> What (exhibition title/concept) -> Where/When (venue/dates) -> Why it matters (cultural relevance) -> Artist quote -> Gallery director statement -> Viewing details/contact.
- Framework 72: Artist Representation Announcement. Structure: Gallery proud to announce -> Artist background (accolades/education) -> Career highlights (shows/collections) -> Why this partnership matters -> First exhibition details.
- Framework 73: Award/Recognition Press Release. Structure: Achievement announcement -> Context/significance in field -> Artist or gallery statement -> Career impact -> Next steps/upcoming.
- Framework 74: Acquisition/Sale Announcement. Structure: Work acquired by [institution/collector] -> Artwork details (title/year/medium) -> Historical significance -> Curator or buyer quote -> Gallery's role in placement.
- Framework 75: Fair Participation Announcement. Structure: Gallery presenting at [fair name] -> Featured artists for booth -> Booth location/number -> Highlight works -> VIP preview details.
- Framework 76: Exhibition Extension/Closing. Structure: Due to popular demand -> Extended until [date] -> Exhibition highlights recap -> Final viewing opportunity -> Call to action (visit/book).

CATEGORY 13: EXHIBITION ANNOUNCEMENTS
- Framework 77: Opening Night Invitation. Structure: Teaser hook (provocative angle) -> Key works preview -> Artist presence confirmed -> Date/time/location -> RSVP urgency (limited capacity).
- Framework 78: Last Chance to See. Structure: Closing soon alert -> Exhibition highlights -> Visitor testimonials or press quotes -> Final X days -> Strong call to visit now.
- Framework 79: Mid-Show Momentum. Structure: X days remaining -> Critical acclaim received -> Works still available -> Behind-the-scenes moment -> Visit prompt.
- Framework 80: Thematic Deep Dive. Structure: Exhibition theme introduction -> Lead artwork analysis -> Artist's intention -> Curatorial thread -> Visit invitation.
- Framework 81: Installation Teaser. Structure: Behind-the-scenes setup in progress -> Scale/ambition reveal -> Artist at work image/story -> Opening date -> Anticipation build.
- Framework 82: Exhibition Series Announcement. Structure: Multi-show concept -> Season overview (themes/timeline) -> First exhibition focus -> Full artist lineup -> Season pass/membership offer.

CATEGORY 14: ARTIST FEATURES
- Framework 83: Artist Spotlight Deep Dive. Structure: Artist background -> Practice philosophy -> Current work focus -> Process insights -> Where to see work now.
- Framework 84: Studio Visit Story. Structure: Arrival moment -> Creative space details -> Work in progress -> Artist quote on process -> Upcoming opportunities to engage.
- Framework 85: Artwork Spotlight. Structure: Visual hook (describe the piece) -> Title/medium/dimensions -> Artist's intention behind work -> Technical or conceptual details -> Availability/inquiry details.
- Framework 86: Artist Career Milestone. Structure: Recent achievement -> Career trajectory summary -> What makes them culturally relevant now -> Next chapter preview -> Gallery relationship.
- Framework 87: Process & Technique Feature. Structure: Technique introduction -> Why artist chose this approach -> Materials/process description -> Effect on viewer experience -> Example work shown.
- Framework 88: Artist Interview Excerpt. Structure: Provocative question -> Artist's surprising or insightful answer -> Context/background -> Deeper implications -> Connection to current exhibition or work.
- Framework 89: Historical Context Positioning. Structure: Art historical movement or precedent -> Artist's contemporary interpretation -> What's different or evolved -> Critical reception -> Why it matters to today's discourse.

CATEGORY 15: COLLECTOR COMMUNICATION
- Framework 90: New Work Available. Structure: Just arrived/released -> Artist background (brief, prestigious) -> Work details (medium/size/edition) -> Why timing matters (market/cultural moment) -> Private viewing invitation.
- Framework 91: Investment Perspective. Structure: Artist market trajectory -> Recent sales/institutional placements -> Critical momentum indicators -> Current opportunity -> Discreet inquiry process.
- Framework 92: Collection Building Insight. Structure: Theme or movement focus -> Why it's timely (market/cultural) -> Key artists in this space -> Strategic collecting approach -> Personalized consultation offer.
- Framework 93: Fair/Biennale Insider Tip. Structure: Event overview -> What serious collectors should watch -> Gallery's booth highlights -> Undervalued opportunity to consider -> Private viewing arrangement at fair.
- Framework 94: Sold Work Announcement. Structure: Work successfully placed -> Collection or institution significance -> Artist momentum impact -> Similar available works -> Waitlist or commission option.
- Framework 95: Exclusive Preview Invitation. Structure: Private viewing opportunity before public opening -> Featured works preview -> Artist attendance -> Date/time exclusivity -> RSVP for limited spots.
- Framework 96: Commission Opportunity. Structure: Artist now accepting commissions -> Recent commission example (image/context) -> Process and timeline -> Investment range indication -> Expression of interest process.

CATEGORY 16: EVENT INVITATIONS
- Framework 97: VIP Opening Reception. Structure: Exclusive first look for select guests -> Exhibition preview highlights -> Artist meet-and-greet -> Curated experience (wine/catering) -> RSVP details and deadline.
- Framework 98: Artist Talk/Panel. Structure: Topic or theme -> Speaker lineup (credentials) -> What attendees will gain -> Conversation format -> Registration link and seating details.
- Framework 99: Curator Walkthrough. Structure: Exhibition context -> Curatorial vision and thesis -> Key insights curator will share -> Intimate group size -> Booking required (limited).
- Framework 100: Workshop/Masterclass. Structure: Skill or technique focus -> Artist or instructor background -> What participants will create/learn -> Materials included -> Limited spots/registration.
- Framework 101: Collectors' Dinner. Structure: Occasion or milestone -> Intimate gathering setting -> Artist or curator presence -> Venue and culinary experience teaser -> Exclusive invitation (by invitation only).
- Framework 102: Portfolio Review/Studio Visit. Structure: Opportunity description -> Who should attend (emerging artists/curators) -> What to bring (portfolio/work samples) -> Booking time slots -> Selection or application criteria.
- Framework 103: Collaboration Event. Structure: Partner organization announcement -> Cross-disciplinary or multimedia angle -> Unique experience promise -> Cultural or social relevance -> RSVP urgency and details.

WHEN GENERATING:
1. Select the most appropriate Framework from the user's selected CATEGORY based on their TOPIC.
2. If the user specifies a specific framework number, use that one.
3. Use the provided "Audience" to tailor the language (e.g., if Gallery Owners, talk about collectors/foot traffic; if Festival Directors, talk about sponsors/logistics).
4. Output the response in Markdown format.
5. Identify which framework you used at the top.
`;

export const FRAMEWORK_PRO_TIPS: Record<string, string> = {
  "Framework 1": "Sequence your truths from the familiar to the uncomfortable so gallery and festival leaders stay engaged.",
  "Framework 2": "Pair each perception with a behind-the-scenes data point—budgets, crating hours, sponsor calls—to prove authority.",
  "Framework 3": "Anchor every lesson to a specific exhibition mishap so vulnerability feels earned.",
  "Framework 4": "Quantify the financial or reputational cost of each rookie mistake before offering the better way.",
  "Framework 5": "Select stereotypes insiders whisper about and explain why embracing the nuance creates leverage.",
  "Framework 6": "Group resources by workflow (funding, logistics, audience) so readers can act on them immediately.",
  "Framework 7": "Tie each hindsight insight to what it would have saved you in time, budget, or trust.",
  "Framework 8": "Name the trap, show the hidden bill, and close with the safeguard you now rely on.",
  "Framework 9": "Paint the sensory details of the turning day so readers feel the before-versus-after contrast.",
  "Framework 10": "Highlight why each choice defied board expectations before revealing the upside.",
  "Framework 11": "Alternate 'I used to think' versus 'Now I know' to show a decade of mindset progression.",
  "Framework 12": "Share a measurable recovery metric to prove the lesson translated into change.",
  "Framework 13": "Let the polished press-release story run first, then expose the gritty logistics that carried it.",
  "Framework 14": "Fact-check each myth with stats or anecdotes only an insider could know.",
  "Framework 15": "State the literal price tag, then unpack the blind spot that caused it.",
  "Framework 16": "Explain the opportunity cost of saying yes so the eventual no feels strategic.",
  "Framework 17": "Quantify the stakes of the decision before revealing the unconventional action.",
  "Framework 18": "Use direct quotes to contrast hollow phrases with what leaders actually say.",
  "Framework 19": "Show the ripple effect of the hiring mistake across cycles to underscore the lesson.",
  "Framework 20": "Attach each habit to a calendar ritual so others can adopt it tomorrow.",
  "Framework 21": "Frame the trust breaker as a pattern you retired and the trust builder as a repeatable play.",
  "Framework 22": "Label each morale killer plainly and offer a fix that fits in a one-week sprint.",
  "Framework 23": "Start with the business metric at risk so the solution feels inevitable.",
  "Framework 24": "Expose the hidden root cause with evidence before prescribing the fix.",
  "Framework 25": "Turn each warning sign into a binary checklist for quick diagnosis.",
  "Framework 26": "Compare the stated reason to the root blocker using data from post-mortems.",
  "Framework 27": "Tie every quick fix to a measurable win within 30 days.",
  "Framework 28": "Show receipts of how the new framework changed throughput or cost.",
  "Framework 29": "Call out the polite lie leadership tells and counter with the operational reality.",
  "Framework 30": "Map the failed complex attempts before showcasing the simple win.",
  "Framework 31": "Spotlight non-obvious skills with proof of how they influence patron spend or partner trust.",
  "Framework 32": "Juxtapose the certification promise with what hiring managers actually reward.",
  "Framework 33": "List the interview questions that expose systems thinking instead of rehearsed answers.",
  "Framework 34": "Describe the hidden pathways and political capital required for each career track.",
  "Framework 35": "Contrast the skill you assumed mattered with the one the board actually rewarded.",
  "Framework 36": "Name the event that forced the mindset shift so juniors can spot the same cue.",
  "Framework 37": "Translate every side-skill into a business outcome such as retention, ticket sales, or sponsorship.",
  "Framework 38": "Identify the complacency pattern and the counter-habit that keeps experts sharp.",
  "Framework 40": "Use client quotes to show what they secretly value before promising your solution.",
  "Framework 41": "Translate each red flag into an immediate boundary-setting script.",
  "Framework 42": "Break down the warm pipeline mechanics and give one metric to track momentum.",
  "Framework 43": "Lay out onboarding touchpoints as calendar entries teams can clone.",
  "Framework 44": "Trace every departure to the small promises that slipped.",
  "Framework 45": "Share the exact wording of the feedback and the operational fix it triggered.",
  "Framework 46": "Recreate the pivotal meeting beat by beat so readers can copy the questioning.",
  "Framework 47": "Role-play the bad no versus the respectful no with swipeable language.",
  "Framework 48": "Reveal the polite reason prospects gave and the forensic truth uncovered later.",
  "Framework 49": "Contrast the mainstream obsession with the quiet innovation you backed and the ROI.",
  "Framework 50": "List the early tells that proved the disruption hype was off.",
  "Framework 51": "Frame the expected future versus the one you prepared for, then show the hedge you took.",
  "Framework 52": "Tie each small tweak to a metric lift so change feels doable.",
  "Framework 53": "Share the failed hypothesis before the surprise outcome to maintain tension.",
  "Framework 54": "Compare the leadership toolkit people rely on today to the skills curators will need tomorrow.",
  "Framework 55": "Expose the quiet operators outperforming headline grabbers.",
  "Framework 56": "Describe the sensory difference between the default routine and the optimized one.",
  "Framework 57": "Translate scaling rules into if-or-then statements tied to headcount or budget.",
  "Framework 58": "Name the exact friction your hack removed and the minutes saved each week.",
  "Framework 59": "Trace workflow failure back to the misaligned signal you now watch.",
  "Framework 60": "Define vanity versus real metrics with numbers from a recent report.",
  "Framework 61": "Document the hours reclaimed after automation and where you reinvested them.",
  "Framework 62": "Rank tools by business-critical capability so leaders know what to fund.",
  "Framework 63": "Lay out the glamorous success cost first, then the hidden maintenance bill.",
  "Framework 64": "Reveal where profit evaporated such as fees, overtime, or discounts before naming the fix.",
  "Framework 65": "Pair each hidden cost with the trigger that helps you spot it early.",
  "Framework 66": "Contrast the volume myth with the margin lever you actually pulled.",
  "Framework 67": "Share the psychological insight that justified the price and the lift it produced.",
  "Framework 68": "Describe the mindset script that moved you from scarcity to asset thinking.",
  "Framework 69": "Cluster flags into onboarding, governance, and finance so readers scan by risk zone.",
  "Framework 70": "Curate news that impacts the bottom line or cultural relevance, not just gossip.",
  "Framework 71": "Lead with the cultural hook before logistical details—why this exhibition matters to the discourse, not just the calendar.",
  "Framework 72": "Highlight institutional validation (collections, awards, residencies) to establish artist credibility immediately.",
  "Framework 73": "Quantify the achievement's rarity or competitive context so the recognition feels earned, not routine.",
  "Framework 74": "Name the acquiring institution prominently and connect the work to their collection narrative for prestige.",
  "Framework 75": "Include booth number and preview times early—collectors scan for logistics first, then artistic merit.",
  "Framework 76": "Use visitor testimonials or press quotes as social proof to justify the extension and create urgency.",
  "Framework 77": "Tease one iconic work as the 'reason to attend' and confirm artist presence to elevate the invitation's intimacy.",
  "Framework 78": "Frame scarcity urgency around which works remain available, not just closing date, to trigger collector action.",
  "Framework 79": "Share a behind-the-scenes moment (installation detail, artist insight) to reward engaged followers with insider access.",
  "Framework 80": "Connect the artwork's formal qualities to the broader curatorial thesis so the post educates as it invites.",
  "Framework 81": "Show the scale or labor of installation to build anticipation—physical transformation creates emotional investment.",
  "Framework 82": "Position the series as a cohesive narrative arc so patrons see value in attending multiple shows.",
  "Framework 83": "Anchor practice philosophy to a recognizable art historical reference so new audiences have an entry point.",
  "Framework 84": "Describe sensory details of the studio space to transport readers and humanize the creative process.",
  "Framework 85": "Mention dimensions early—collectors mentally place works in their spaces before engaging conceptually.",
  "Framework 86": "Tie the milestone to market momentum or institutional validation to signal investment potential without stating price.",
  "Framework 87": "Explain the technique's difficulty or rarity to justify the work's value and differentiate from digital reproductions.",
  "Framework 88": "Choose a question that challenges artist mythology and let the answer reframe their practice authentically.",
  "Framework 89": "Name the historical precedent clearly so the contemporary twist feels like evolution, not imitation.",
  "Framework 90": "Lead with 'just arrived' to create immediacy, then layer in prestige markers (residency, collection placements) to justify interest.",
  "Framework 91": "Cite specific auction results or institutional acquisitions as evidence, not opinion, to ground investment thesis.",
  "Framework 92": "Identify an emerging theme before it becomes consensus—early positioning signals curatorial foresight.",
  "Framework 93": "Offer logistical value (booth walkthrough appointment, pre-fair viewing) so the tip translates into convenience.",
  "Framework 94": "Announce sold works to create scarcity and momentum while offering waitlist or commission path to capture demand.",
  "Framework 95": "Emphasize 'before public opening' to trigger exclusivity reflex, then confirm artist attendance for intimacy.",
  "Framework 96": "Show a past commission's context (collector's space, exhibition placement) to help prospects visualize their own.",
  "Framework 97": "Specify 'select guests' or 'by invitation' to reinforce exclusivity even if invite list is broad.",
  "Framework 98": "Preview a provocative question the panel will address so attendees feel they'll gain insider perspective.",
  "Framework 99": "Cap group size and require booking to signal intimate access, not a public lecture.",
  "Framework 100": "Promise a tangible takeaway (finished work, new skill) so attendees justify the time investment.",
  "Framework 101": "Mention the venue or chef if notable—collectors attend for the holistic cultural experience.",
  "Framework 102": "Clarify selection criteria upfront so applicants self-select and you receive higher-quality submissions.",
  "Framework 103": "Name the partner organization and explain the conceptual bridge between disciplines to intrigue cross-sector audiences."
};
