/**
 * Abandoned checkout email templates
 * 3-email sequence for cart recovery
 *
 * Design philosophy: Plain text feel, spacing = authority
 * - White/system background
 * - Default font
 * - Generous whitespace
 * - Isolated CTA
 * - Subtle but visible unsubscribe
 */

import { EMAIL_URLS, DISCOUNT_CODES } from "../constants";

function getEmailWrapper(content: string, email: string): string {
  const unsubscribeUrl = `${EMAIL_URLS.UNSUBSCRIBE}?email=${encodeURIComponent(email)}`;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
</head>
<body style="margin: 0; padding: 0; background-color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #ffffff;">
    <tr>
      <td style="padding: 40px 24px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 480px;">
          <tr>
            <td style="font-size: 15px; line-height: 1.8; color: #1a1a1a;">
              ${content}
              
              <!-- Signature + Opt out -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top: 48px;">
                <tr>
                  <td style="font-size: 15px; line-height: 1.6; color: #1a1a1a;">
                    —<br>
                    Ace<br>
                    <span style="color: #666666;">Founder, Richflex</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top: 24px;">
                    <a href="${unsubscribeUrl}" style="font-size: 13px; color: #888888; text-decoration: underline;">Opt out</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

/**
 * Email 1: ~1 hour - "You didn't finish — probably accidental"
 */
export function getEmail1(email: string): { subject: string; html: string } {
  const content = `
              <p style="margin: 0 0 24px 0;">
                Hey —
              </p>
              
              <p style="margin: 0 0 24px 0;">
                You were upgrading on Richflex and stopped mid-checkout.
              </p>
              
              <p style="margin: 0 0 24px 0;">
                That usually happens for one reason: interruption, not indecision.
              </p>
              
              <p style="margin: 0 0 24px 0;">
                So I'll keep this simple.
              </p>
              
              <p style="margin: 0 0 24px 0;">
                Richflex is for people who understand one thing early:<br>
                <strong>how you look online decides how you're treated offline.</strong>
              </p>
              
              <p style="margin: 0 0 32px 0;">
                If you meant to finish, your access is still waiting here.
              </p>
              
              <p style="margin: 0 0 8px 0; color: #666666;">
                Continue here:
              </p>
              <p style="margin: 0 0 24px 0;">
                <a href="${EMAIL_URLS.APP}" style="color: #1a1a1a; text-decoration: underline;">${EMAIL_URLS.APP}</a>
              </p>
              
              <p style="margin: 0;">
                If not, no worries — this isn't for everyone.
              </p>
  `;

  return {
    subject: "You didn't finish — probably accidental",
    html: getEmailWrapper(content, email),
  };
}

/**
 * Email 2: ~22 hours - "This is the part people underestimate"
 */
export function getEmail2(email: string): { subject: string; html: string } {
  const content = `
              <p style="margin: 0 0 24px 0;">
                Hey —
              </p>
              
              <p style="margin: 0 0 24px 0;">
                Most people don't decide against Richflex.
              </p>
              
              <p style="margin: 0 0 24px 0;">
                They delay.
              </p>
              
              <p style="margin: 0 0 24px 0;">
                And delay is usually just a polite way of saying:<br>
                "I'll keep showing up online with the same signals."
              </p>
              
              <p style="margin: 0 0 24px 0;">
                Here's the reality:
              </p>
              
              <p style="margin: 0 0 24px 0;">
                Online, people don't analyze you.<br>
                They <strong>place</strong> you.
              </p>
              
              <p style="margin: 0 0 24px 0;">
                Your visuals tell them whether you're:
              </p>
              
              <p style="margin: 0 0 24px 0; padding-left: 16px;">
                • worth replying to<br>
                • worth paying attention to<br>
                • worth taking seriously
              </p>
              
              <p style="margin: 0 0 32px 0;">
                Richflex doesn't change who you are.<br>
                It changes the <strong>frame</strong> people see you in.
              </p>
              
              <p style="margin: 0 0 8px 0; color: #666666;">
                If you're ready to control that:
              </p>
              <p style="margin: 0 0 24px 0;">
                <a href="${EMAIL_URLS.APP}" style="color: #1a1a1a; text-decoration: underline;">${EMAIL_URLS.APP}</a>
              </p>
              
              <p style="margin: 0;">
                If not, nothing breaks.<br>
                You just keep the same outcomes.
              </p>
  `;

  return {
    subject: "This is the part people underestimate",
    html: getEmailWrapper(content, email),
  };
}

/**
 * Email 3: ~72 hours - "I won't follow up again" + discount code
 */
export function getEmail3(email: string): { subject: string; html: string } {
  const content = `
              <p style="margin: 0 0 24px 0;">
                Hey —
              </p>
              
              <p style="margin: 0 0 24px 0;">
                I don't like chasing.
              </p>
              
              <p style="margin: 0 0 24px 0;">
                So this is the last email you'll get from me about this.
              </p>
              
              <p style="margin: 0 0 24px 0;">
                You were already upgrading, which tells me one thing:<br>
                you saw the leverage.
              </p>
              
              <p style="margin: 0 0 24px 0;">
                If timing was the only friction, use this private code:
              </p>
              
              <p style="margin: 0 0 24px 0;">
                <strong style="font-size: 18px; letter-spacing: 2px;">${DISCOUNT_CODES.ABANDONED_CHECKOUT}</strong>
              </p>
              
              <p style="margin: 0 0 32px 0;">
                It drops the price by 30%.<br>
                No public page. No banner. No reminders.
              </p>
              
              <p style="margin: 0 0 8px 0; color: #666666;">
                Redeem it here:
              </p>
              <p style="margin: 0 0 24px 0;">
                <a href="${EMAIL_URLS.APP}" style="color: #1a1a1a; text-decoration: underline;">${EMAIL_URLS.APP}</a>
              </p>
              
              <p style="margin: 0;">
                If you pass, that's fine.<br>
                People who don't care about perception rarely notice what it costs them.
              </p>
  `;

  return {
    subject: "I won't follow up again",
    html: getEmailWrapper(content, email),
  };
}
