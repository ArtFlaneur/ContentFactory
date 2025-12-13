# Supabase Configuration Guide

## 1. Security & Server Settings

To ensure your authentication flows work correctly and securely in production:

1.  Go to **Authentication** -> **URL Configuration** in your Supabase Dashboard.
2.  **Site URL**: Set this to your production URL (e.g., `https://content-factory.vercel.app`).
    *   *For local development, this is usually `http://localhost:5173`.*
3.  **Redirect URLs**: Add the following:
    *   `http://localhost:5173/**`
    *   `https://your-production-domain.com/**`
    *   `https://your-production-domain.com/auth/callback`

## 2. Email Templates

To make your emails look professional, go to **Authentication** -> **Email Templates**.

### General Style (Copy this CSS into the `<head>` of all templates if possible, or inline it)
Supabase templates support basic HTML.

### A. Confirm Your Signup
**Subject**: Welcome to Content Factory! Confirm your email

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #334155; background-color: #f8fafc; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
    .header { background: linear-gradient(to right, #4f46e5, #7c3aed); padding: 32px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 24px; font-weight: 700; }
    .content { padding: 40px 32px; }
    .button { display: inline-block; background-color: #4f46e5; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 24px; }
    .footer { padding: 24px; text-align: center; font-size: 12px; color: #94a3b8; background-color: #f1f5f9; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Content Factory</h1>
    </div>
    <div class="content">
      <h2>Confirm your email address</h2>
      <p>Welcome to the factory! You're just one step away from creating viral content.</p>
      <p>Please confirm your email address to activate your account and save your settings.</p>
      <center>
        <a href="{{ .ConfirmationURL }}" class="button">Confirm Email</a>
      </center>
      <p style="margin-top: 32px; font-size: 14px; color: #64748b;">If you didn't request this, you can safely ignore this email.</p>
    </div>
    <div class="footer">
      &copy; 2025 Art Flaneur. All rights reserved.
    </div>
  </div>
</body>
</html>
```

### B. Magic Link
**Subject**: Log in to Content Factory

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #334155; background-color: #f8fafc; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
    .header { background: linear-gradient(to right, #4f46e5, #7c3aed); padding: 32px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 24px; font-weight: 700; }
    .content { padding: 40px 32px; }
    .button { display: inline-block; background-color: #4f46e5; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 24px; }
    .footer { padding: 24px; text-align: center; font-size: 12px; color: #94a3b8; background-color: #f1f5f9; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Content Factory</h1>
    </div>
    <div class="content">
      <h2>Your Magic Link</h2>
      <p>Click the button below to log in to your account instantly.</p>
      <center>
        <a href="{{ .ConfirmationURL }}" class="button">Log In Now</a>
      </center>
      <p style="margin-top: 32px; font-size: 14px; color: #64748b;">This link will expire in 24 hours.</p>
    </div>
    <div class="footer">
      &copy; 2025 Art Flaneur. All rights reserved.
    </div>
  </div>
</body>
</html>
```

### C. Reset Password
**Subject**: Reset your Content Factory password

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #334155; background-color: #f8fafc; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
    .header { background: linear-gradient(to right, #4f46e5, #7c3aed); padding: 32px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 24px; font-weight: 700; }
    .content { padding: 40px 32px; }
    .button { display: inline-block; background-color: #4f46e5; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 24px; }
    .footer { padding: 24px; text-align: center; font-size: 12px; color: #94a3b8; background-color: #f1f5f9; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Content Factory</h1>
    </div>
    <div class="content">
      <h2>Reset Password</h2>
      <p>We received a request to reset your password. Click the button below to choose a new one.</p>
      <center>
        <a href="{{ .ConfirmationURL }}" class="button">Reset Password</a>
      </center>
    </div>
    <div class="footer">
      &copy; 2025 Art Flaneur. All rights reserved.
    </div>
  </div>
</body>
</html>
```

## 3. SMTP Settings (Optional but Recommended)

For better deliverability and to remove the "via supabase.co" label:
1.  Go to **Settings** -> **SMTP Settings**.
2.  Enable **Custom SMTP**.
3.  Enter details from your email provider (e.g., Resend, SendGrid, AWS SES, or your domain host).
