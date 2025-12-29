<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Content Factory

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1yl5l6j2JBs0ypj0bTehgfKyuWbFuCcUN

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Create `.env.local` file based on `.env.example` and set:
   - `ANTHROPIC_API_KEY` - Your Azure Anthropic API key
   - `VITE_STRIPE_PAYMENT_LINK` - Your Stripe payment link (optional, defaults to production link)
   - `SUPABASE_URL` and `SUPABASE_ANON_KEY` - Your Supabase project credentials
3. Run the app:
   `npm run dev`
