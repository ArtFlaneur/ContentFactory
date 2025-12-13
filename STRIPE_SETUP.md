# Stripe Webhook Setup Guide

To enable secure automatic upgrades, follow these steps:

## 1. Get Supabase Service Role Key
1. Go to Supabase Dashboard -> Project Settings -> API.
2. Find the `service_role` key (secret). **Never share this key publicly.**
3. Add it to your `.env.local` (for testing) and Vercel Environment Variables:
   ```
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   ```

## 2. Get Stripe Keys
1. Go to Stripe Dashboard -> Developers -> API Keys.
2. Copy the `Secret key` (`sk_test_...` or `sk_live_...`).
3. Add it to your environment variables:
   ```
   STRIPE_SECRET_KEY=sk_test_...
   ```

   > **Совет по безопасности:** Вместо полного `Secret key`, лучше создать **Restricted Key** с правами **Read** для ресурсов `Checkout Sessions` и `Events`.

## 3. Configure Webhook in Stripe
1. Go to Stripe Dashboard -> Developers -> Webhooks.
2. Click **"Add endpoint"**.
3. **Endpoint URL**: 
   - For Production: `https://your-project.vercel.app/api/webhook`
   - For Local Testing: Use Stripe CLI (see below).
4. **Events to listen for**: Select `checkout.session.completed`.
5. Click "Add endpoint".
6. Copy the **Signing secret** (`whsec_...`) shown on the screen.
7. Add it to your environment variables:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

## 4. Local Testing (Optional)
If you want to test webhooks on localhost:
1. Install Stripe CLI: `brew install stripe/stripe-cli/stripe`
2. Login: `stripe login`
3. Forward events: `stripe listen --forward-to localhost:5173/api/webhook`
4. Copy the webhook secret output by the CLI command to your `.env.local`.
