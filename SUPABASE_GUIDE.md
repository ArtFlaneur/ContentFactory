# Supabase Configuration Guide

## 1. Security & Server Settings

To ensure your authentication flows work correctly and securely in production:

1.  Go to **Authentication** -> **URL Configuration** in your Supabase Dashboard.
2.  **Site URL**: Set this to your production URL (e.g., `https://content-factory-kohl.vercel.app`).
    *   *For local development, this is usually `http://localhost:5173`.*
3.  **Redirect URLs**: Add the following:
    *   `http://localhost:5173/**`
  *   `https://content-factory-kohl.vercel.app/**`

Tip: this app also supports an optional `VITE_SITE_URL` env var to force the redirect base used in auth emails.
Set `VITE_SITE_URL=https://content-factory-kohl.vercel.app` in Vercel Environment Variables.

## 2. Email Templates

To make your emails look professional, go to **Authentication** -> **Email Templates**.

### Mondrian-lite Email Style
Supabase templates support basic HTML. For best compatibility across email clients, the templates below use table layout and mostly inline styles.

### A. Confirm Your Signup
**Subject**: Welcome to Make Content — confirm your email

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
</head>
<body style="margin:0;padding:0;background:#f8fafc;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#f8fafc;">
    <tr>
      <td align="center" style="padding:32px 12px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width:600px;width:100%;background:#ffffff;border:2px solid #000000;">
          <tr>
            <td style="padding:0;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-bottom:2px solid #000000;">
                <tr>
                  <td width="25%" height="14" style="background:#c7d2fe;border-right:2px solid #000000;">&nbsp;</td>
                  <td width="25%" height="14" style="background:#fde68a;border-right:2px solid #000000;">&nbsp;</td>
                  <td width="25%" height="14" style="background:#a7f3d0;border-right:2px solid #000000;">&nbsp;</td>
                  <td width="25%" height="14" style="background:#fecdd3;">&nbsp;</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:18px 20px 0 20px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#0f172a;">
              <div style="font-size:18px;font-weight:800;line-height:1.2;">Make Content</div>
              <div style="margin-top:6px;font-size:12px;font-weight:600;color:#475569;">Confirm your email to activate your account</div>
            </td>
          </tr>
          <tr>
            <td style="padding:18px 20px 22px 20px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#334155;line-height:1.6;">
              <h2 style="margin:0 0 10px 0;font-size:18px;line-height:1.3;color:#0f172a;">Confirm your email</h2>
              <p style="margin:0 0 14px 0;">Thanks for signing up. Confirm your email address to activate your account and start saving your settings.</p>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:18px 0 8px 0;">
                <tr>
                  <td align="center" style="background:#c7d2fe;border:2px solid #000000;">
                    <a href="{{ .ConfirmationURL }}" style="display:inline-block;padding:12px 16px;font-weight:800;text-decoration:none;color:#0f172a;font-size:14px;">Confirm Email</a>
                  </td>
                </tr>
              </table>
              <p style="margin:10px 0 0 0;font-size:12px;color:#64748b;">If the button doesn’t work, paste this link into your browser:</p>
              <p style="margin:6px 0 0 0;font-size:12px;word-break:break-all;"><a href="{{ .ConfirmationURL }}" style="color:#0f172a;">{{ .ConfirmationURL }}</a></p>
              <p style="margin:18px 0 0 0;font-size:12px;color:#64748b;">If you didn’t request this, you can safely ignore this email.</p>
            </td>
          </tr>
          <tr>
            <td style="padding:14px 20px;border-top:2px solid #000000;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#64748b;font-size:12px;">
              © 2025 Art Flaneur
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

### B. Magic Link
**Subject**: Log in to Make Content

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
</head>
<body style="margin:0;padding:0;background:#f8fafc;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#f8fafc;">
    <tr>
      <td align="center" style="padding:32px 12px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width:600px;width:100%;background:#ffffff;border:2px solid #000000;">
          <tr>
            <td style="padding:0;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-bottom:2px solid #000000;">
                <tr>
                  <td width="25%" height="14" style="background:#c7d2fe;border-right:2px solid #000000;">&nbsp;</td>
                  <td width="25%" height="14" style="background:#fde68a;border-right:2px solid #000000;">&nbsp;</td>
                  <td width="25%" height="14" style="background:#a7f3d0;border-right:2px solid #000000;">&nbsp;</td>
                  <td width="25%" height="14" style="background:#fecdd3;">&nbsp;</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:18px 20px 0 20px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#0f172a;">
              <div style="font-size:18px;font-weight:800;line-height:1.2;">Make Content</div>
              <div style="margin-top:6px;font-size:12px;font-weight:600;color:#475569;">Your secure sign-in link</div>
            </td>
          </tr>
          <tr>
            <td style="padding:18px 20px 22px 20px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#334155;line-height:1.6;">
              <h2 style="margin:0 0 10px 0;font-size:18px;line-height:1.3;color:#0f172a;">Your magic link</h2>
              <p style="margin:0 0 14px 0;">Use this button to log in. If you didn’t request it, ignore this email.</p>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:18px 0 8px 0;">
                <tr>
                  <td align="center" style="background:#fde68a;border:2px solid #000000;">
                    <a href="{{ .ConfirmationURL }}" style="display:inline-block;padding:12px 16px;font-weight:800;text-decoration:none;color:#0f172a;font-size:14px;">Log In</a>
                  </td>
                </tr>
              </table>
              <p style="margin:10px 0 0 0;font-size:12px;color:#64748b;">If the button doesn’t work, paste this link into your browser:</p>
              <p style="margin:6px 0 0 0;font-size:12px;word-break:break-all;"><a href="{{ .ConfirmationURL }}" style="color:#0f172a;">{{ .ConfirmationURL }}</a></p>
              <p style="margin:18px 0 0 0;font-size:12px;color:#64748b;">This link expires (per your Supabase Auth settings).</p>
            </td>
          </tr>
          <tr>
            <td style="padding:14px 20px;border-top:2px solid #000000;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#64748b;font-size:12px;">
              © 2025 Art Flaneur
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

### C. Reset Password
**Subject**: Reset your Make Content password

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
</head>
<body style="margin:0;padding:0;background:#f8fafc;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#f8fafc;">
    <tr>
      <td align="center" style="padding:32px 12px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width:600px;width:100%;background:#ffffff;border:2px solid #000000;">
          <tr>
            <td style="padding:0;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-bottom:2px solid #000000;">
                <tr>
                  <td width="25%" height="14" style="background:#c7d2fe;border-right:2px solid #000000;">&nbsp;</td>
                  <td width="25%" height="14" style="background:#fde68a;border-right:2px solid #000000;">&nbsp;</td>
                  <td width="25%" height="14" style="background:#a7f3d0;border-right:2px solid #000000;">&nbsp;</td>
                  <td width="25%" height="14" style="background:#fecdd3;">&nbsp;</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:18px 20px 0 20px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#0f172a;">
              <div style="font-size:18px;font-weight:800;line-height:1.2;">Make Content</div>
              <div style="margin-top:6px;font-size:12px;font-weight:600;color:#475569;">Reset your password</div>
            </td>
          </tr>
          <tr>
            <td style="padding:18px 20px 22px 20px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#334155;line-height:1.6;">
              <h2 style="margin:0 0 10px 0;font-size:18px;line-height:1.3;color:#0f172a;">Reset password</h2>
              <p style="margin:0 0 14px 0;">We received a request to reset your password. Use the button below to set a new one.</p>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:18px 0 8px 0;">
                <tr>
                  <td align="center" style="background:#fecdd3;border:2px solid #000000;">
                    <a href="{{ .ConfirmationURL }}" style="display:inline-block;padding:12px 16px;font-weight:800;text-decoration:none;color:#0f172a;font-size:14px;">Reset Password</a>
                  </td>
                </tr>
              </table>
              <p style="margin:10px 0 0 0;font-size:12px;color:#64748b;">If the button doesn’t work, paste this link into your browser:</p>
              <p style="margin:6px 0 0 0;font-size:12px;word-break:break-all;"><a href="{{ .ConfirmationURL }}" style="color:#0f172a;">{{ .ConfirmationURL }}</a></p>
              <p style="margin:18px 0 0 0;font-size:12px;color:#64748b;">If you didn’t request a password reset, ignore this email.</p>
            </td>
          </tr>
          <tr>
            <td style="padding:14px 20px;border-top:2px solid #000000;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#64748b;font-size:12px;">
              © 2025 Art Flaneur
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

### D. Invite User
**Subject**: You’ve been invited to Make Content

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
</head>
<body style="margin:0;padding:0;background:#f8fafc;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#f8fafc;">
    <tr>
      <td align="center" style="padding:32px 12px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width:600px;width:100%;background:#ffffff;border:2px solid #000000;">
          <tr>
            <td style="padding:0;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-bottom:2px solid #000000;">
                <tr>
                  <td width="25%" height="14" style="background:#c7d2fe;border-right:2px solid #000000;">&nbsp;</td>
                  <td width="25%" height="14" style="background:#fde68a;border-right:2px solid #000000;">&nbsp;</td>
                  <td width="25%" height="14" style="background:#a7f3d0;border-right:2px solid #000000;">&nbsp;</td>
                  <td width="25%" height="14" style="background:#fecdd3;">&nbsp;</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:18px 20px 0 20px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#0f172a;">
              <div style="font-size:18px;font-weight:800;line-height:1.2;">Make Content</div>
              <div style="margin-top:6px;font-size:12px;font-weight:600;color:#475569;">Invitation</div>
            </td>
          </tr>
          <tr>
            <td style="padding:18px 20px 22px 20px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#334155;line-height:1.6;">
              <h2 style="margin:0 0 10px 0;font-size:18px;line-height:1.3;color:#0f172a;">You’ve been invited</h2>
              <p style="margin:0 0 14px 0;">Click the button below to accept the invitation and finish setting up your account.</p>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:18px 0 8px 0;">
                <tr>
                  <td align="center" style="background:#a7f3d0;border:2px solid #000000;">
                    <a href="{{ .ConfirmationURL }}" style="display:inline-block;padding:12px 16px;font-weight:800;text-decoration:none;color:#0f172a;font-size:14px;">Accept Invite</a>
                  </td>
                </tr>
              </table>
              <p style="margin:10px 0 0 0;font-size:12px;color:#64748b;">If the button doesn’t work, paste this link into your browser:</p>
              <p style="margin:6px 0 0 0;font-size:12px;word-break:break-all;"><a href="{{ .ConfirmationURL }}" style="color:#0f172a;">{{ .ConfirmationURL }}</a></p>
            </td>
          </tr>
          <tr>
            <td style="padding:14px 20px;border-top:2px solid #000000;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#64748b;font-size:12px;">
              © 2025 Art Flaneur
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

### E. Email Change
**Subject**: Confirm your new email for Make Content

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
</head>
<body style="margin:0;padding:0;background:#f8fafc;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#f8fafc;">
    <tr>
      <td align="center" style="padding:32px 12px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width:600px;width:100%;background:#ffffff;border:2px solid #000000;">
          <tr>
            <td style="padding:0;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-bottom:2px solid #000000;">
                <tr>
                  <td width="25%" height="14" style="background:#c7d2fe;border-right:2px solid #000000;">&nbsp;</td>
                  <td width="25%" height="14" style="background:#fde68a;border-right:2px solid #000000;">&nbsp;</td>
                  <td width="25%" height="14" style="background:#a7f3d0;border-right:2px solid #000000;">&nbsp;</td>
                  <td width="25%" height="14" style="background:#fecdd3;">&nbsp;</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:18px 20px 0 20px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#0f172a;">
              <div style="font-size:18px;font-weight:800;line-height:1.2;">Make Content</div>
              <div style="margin-top:6px;font-size:12px;font-weight:600;color:#475569;">Confirm email change</div>
            </td>
          </tr>
          <tr>
            <td style="padding:18px 20px 22px 20px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#334155;line-height:1.6;">
              <h2 style="margin:0 0 10px 0;font-size:18px;line-height:1.3;color:#0f172a;">Confirm your new email</h2>
              <p style="margin:0 0 14px 0;">Use the button below to confirm this email address for your account.</p>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:18px 0 8px 0;">
                <tr>
                  <td align="center" style="background:#c7d2fe;border:2px solid #000000;">
                    <a href="{{ .ConfirmationURL }}" style="display:inline-block;padding:12px 16px;font-weight:800;text-decoration:none;color:#0f172a;font-size:14px;">Confirm Email Change</a>
                  </td>
                </tr>
              </table>
              <p style="margin:10px 0 0 0;font-size:12px;color:#64748b;">If the button doesn’t work, paste this link into your browser:</p>
              <p style="margin:6px 0 0 0;font-size:12px;word-break:break-all;"><a href="{{ .ConfirmationURL }}" style="color:#0f172a;">{{ .ConfirmationURL }}</a></p>
            </td>
          </tr>
          <tr>
            <td style="padding:14px 20px;border-top:2px solid #000000;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#64748b;font-size:12px;">
              © 2025 Art Flaneur
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

## 3. SMTP Settings (Optional but Recommended)

For better deliverability and to remove the "via supabase.co" label:
1.  Go to **Settings** -> **SMTP Settings**.
2.  Enable **Custom SMTP**.
3.  Enter details from your email provider (e.g., Resend, SendGrid, AWS SES, or your domain host).
