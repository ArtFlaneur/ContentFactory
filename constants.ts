import { Audience, Category, PostGoal, PostTone } from "./types";

export const AUDIENCE_OPTIONS = Object.values(Audience);
export const CATEGORY_OPTIONS = Object.values(Category);
export const GOAL_OPTIONS = Object.values(PostGoal);
export const TONE_OPTIONS = Object.values(PostTone);

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
  [Category.COMMENTS]: []
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
  "Framework 70": "Curate news that impacts the bottom line or cultural relevance, not just gossip."
};
