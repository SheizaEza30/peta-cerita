import { resend, EMAIL_FROM } from "./client";

type SendPasswordResetParams = {
  to: string;
  userName: string;
  resetUrl: string;
};

export async function sendPasswordResetEmail({
  to,
  userName,
  resetUrl,
}: SendPasswordResetParams) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("[EMAIL] RESEND_API_KEY tidak di-set, skip kirim email");
    return { skipped: true };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM,
      to,
      subject: "Reset Password — Peta Cerita",
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc; margin: 0; padding: 40px 20px;">
  <div style="max-width: 560px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">

    <!-- Header -->
    <div style="background: linear-gradient(135deg, #1f9d69 0%, #0d9488 100%); padding: 32px; text-align: center;">
      <div style="font-size: 48px; margin-bottom: 8px;">📖</div>
      <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 700;">Peta Cerita</h1>
    </div>

    <!-- Content -->
    <div style="padding: 40px 32px;">
      <h2 style="margin: 0 0 16px; color: #0f172a; font-size: 20px;">Reset Password</h2>

      <p style="color: #475569; line-height: 1.6; margin: 0 0 16px;">
        Halo <strong>${userName}</strong>,
      </p>

      <p style="color: #475569; line-height: 1.6; margin: 0 0 24px;">
        Kami menerima permintaan untuk reset password akun Peta Cerita kamu.
        Klik tombol di bawah untuk membuat password baru.
      </p>

      <div style="text-align: center; margin: 32px 0;">
        <a href="${resetUrl}" style="display: inline-block; background: #1f9d69; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
          Reset Password
        </a>
      </div>

      <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin: 24px 0 0;">
        Atau copy link di bawah ke browser:
      </p>
      <p style="background: #f1f5f9; padding: 12px; border-radius: 6px; font-size: 13px; color: #334155; word-break: break-all; font-family: monospace;">
        ${resetUrl}
      </p>

      <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin-top: 24px; border-radius: 6px;">
        <p style="margin: 0; color: #92400e; font-size: 14px;">
          ⚠️ Link ini berlaku selama <strong>1 jam</strong>.
          Kalau kamu tidak meminta reset password, abaikan email ini.
        </p>
      </div>
    </div>

    <!-- Footer -->
    <div style="background: #f8fafc; padding: 24px 32px; text-align: center; border-top: 1px solid #e2e8f0;">
      <p style="margin: 0; color: #94a3b8; font-size: 12px;">
        Email otomatis dari Peta Cerita · Jangan balas email ini
      </p>
    </div>

  </div>
</body>
</html>
      `,
    });

    if (error) {
      console.error("[EMAIL_ERROR]", error);
      return { error };
    }

    return { data };
  } catch (err) {
    console.error("[EMAIL_SEND_ERROR]", err);
    return { error: err };
  }
}