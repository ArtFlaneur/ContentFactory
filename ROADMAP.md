# Roadmap: Content Factory SaaS Transformation

## Phase 1: Foundation (Architecture & Data)
- [ ] **Define Data Models**: Create TypeScript interfaces for User Profile and Onboarding.
- [ ] **Setup Supabase**: (External Step) Initialize project for Auth and Database.
- [ ] **Auth Integration**: Add Login/Signup pages to the React app.

## Phase 2: The "Constructor" (Onboarding Flow)
- [ ] **Wizard Component**: Create a multi-step form for new users.
    - Step 1: Industry & Role
    - Step 2: Target Audience Definition
    - Step 3: Platform & Format Selection
- [ ] **Profile Saving**: Logic to save these preferences to the database.
- [ ] **Personalized Dashboard**: Update `InputForm.tsx` to load defaults from the User Profile instead of hardcoded constants.

## Phase 3: Limits & Monetization
- [ ] **Usage Tracking**: Increment a counter in DB every time `generateLinkedInPost` is called.
- [ ] **The Gatekeeper**: Modify the API call to check: `if (count >= 3 && status === 'free') throw Error('Payment Required')`.
- [ ] **Paywall UI**: Create a pricing modal/page.
- [ ] **Stripe Integration**: (External Step) Setup payment link and webhook to update user status to 'pro'.

## Phase 4: Refinement
- [ ] **Custom CTAs**: Allow users to save their own Call-to-Actions in the onboarding.
- [ ] **Tone Calibration**: Let users upload a sample of text to analyze and save their "Tone".
