import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(request: NextRequest) {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const body = await request.json();
    const { type, itemName, userEmail } = body;

    if (!type || !itemName) {
      return NextResponse.json(
        { error: "Type and item name are required" },
        { status: 400 }
      );
    }

    const typeLabel = type === "template" ? "Template" : "Object";
    const emailSubject = `New ${typeLabel} Request - Richflex`;
    const emailBody = `
A user has requested a new ${type}:

${typeLabel} Name: ${itemName}
${userEmail ? `User Email: ${userEmail}` : "User Email: Not provided"}

Please review and add this ${type} to the platform.
    `.trim();

    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "noreply@richflex.co",
      to: "karacspeter03@gmail.com",
      subject: emailSubject,
      text: emailBody,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0a0a0a;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 480px; background-color: #141414; border-radius: 16px; border: 1px solid #262626;">
          <tr>
            <td style="padding: 48px 40px;">
              <h1 style="margin: 0 0 24px 0; font-size: 24px; font-weight: 600; color: #ffffff;">
                New ${typeLabel} Request
              </h1>
              
              <div style="background-color: #1f1f1f; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                <p style="margin: 0 0 12px 0; font-size: 14px; color: #a3a3a3;">
                  ${typeLabel} Name
                </p>
                <p style="margin: 0; font-size: 18px; font-weight: 500; color: #ffffff;">
                  ${itemName}
                </p>
              </div>
              
              ${
                userEmail
                  ? `
              <div style="background-color: #1f1f1f; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                <p style="margin: 0 0 12px 0; font-size: 14px; color: #a3a3a3;">
                  User Email
                </p>
                <p style="margin: 0; font-size: 16px; color: #ffffff;">
                  <a href="mailto:${userEmail}" style="color: #60a5fa; text-decoration: none;">${userEmail}</a>
                </p>
              </div>
              `
                  : ""
              }
              
              <p style="margin: 0; font-size: 14px; color: #737373;">
                Please review and add this ${type} to the platform.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `,
    });

    console.log(`[Request Item] Sent ${type} request: ${itemName}`);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Request Item] Error sending email:", error);
    return NextResponse.json(
      { error: "Failed to send request" },
      { status: 500 }
    );
  }
}
