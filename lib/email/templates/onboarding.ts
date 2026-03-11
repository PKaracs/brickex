/**
 * Onboarding email templates
 * 5-email sequence for new signups (sent from getrichflex.com)
 * 
 * Design philosophy: Plain text feel, spacing = authority
 * - White/system background
 * - Default font
 * - Generous whitespace
 * - Isolated CTA
 * - Subtle but visible unsubscribe
 */

const UNSUBSCRIBE_BASE_URL = "https://app.richflex.co/api/email/unsubscribe";
const APP_URL = "https://app.richflex.co";

function getEmailWrapper(content: string, email: string): string {
  const unsubscribeUrl = `${UNSUBSCRIBE_BASE_URL}?email=${encodeURIComponent(email)}`;
  
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
 * Email 0 — Immediate (5 minutes)
 * Purpose: Force first action NOW
 */
export function getOnboardingEmail0(email: string): { subject: string; html: string } {
  const content = `
              <p style="margin: 0 0 24px 0;">
                You didn't sign up for Richflex to "check it out later".
              </p>
              
              <p style="margin: 0 0 24px 0;">
                You signed up because something about how you look online<br>
                isn't working the way it should.
              </p>
              
              <p style="margin: 0 0 24px 0;">
                Here's the fastest way to see if this matters for you:
              </p>
              
              <p style="margin: 0 0 24px 0; padding-left: 16px; border-left: 2px solid #e5e5e5;">
                Open Richflex.<br>
                Generate one image.<br>
                Compare it to what you're using now.
              </p>
              
              <p style="margin: 0 0 32px 0;">
                If you don't see the difference immediately,<br>
                close the tab and forget about it.
              </p>
              
              <p style="margin: 0 0 8px 0; color: #666666;">
                Start here:
              </p>
              <p style="margin: 0;">
                <a href="${APP_URL}" style="color: #1a1a1a; text-decoration: underline;">${APP_URL}</a>
              </p>
  `;

  return {
    subject: "You signed up for a reason",
    html: getEmailWrapper(content, email),
  };
}

/**
 * Email 1 — +4 hours
 * Purpose: Agitate the cost of staying the same
 */
export function getOnboardingEmail1(email: string): { subject: string; html: string } {
  const content = `
              <p style="margin: 0 0 24px 0;">
                No one tells you this because it sounds harsh:
              </p>
              
              <p style="margin: 0 0 24px 0;">
                People don't "get to know you" online.<br>
                They decide what tier you belong to and move on.
              </p>
              
              <p style="margin: 0 0 24px 0;">
                Your photos decide:
              </p>
              
              <p style="margin: 0 0 24px 0; padding-left: 16px;">
                • who replies<br>
                • who ignores<br>
                • who takes you seriously
              </p>
              
              <p style="margin: 0 0 32px 0;">
                Most people never fix this.<br>
                They just accept weaker results and call it "normal".
              </p>
              
              <p style="margin: 0 0 8px 0; color: #666666;">
                If you want to see what changes when the signal changes:
              </p>
              <p style="margin: 0;">
                <a href="${APP_URL}" style="color: #1a1a1a; text-decoration: underline;">${APP_URL}</a>
              </p>
  `;

  return {
    subject: "This is what people won't tell you",
    html: getEmailWrapper(content, email),
  };
}

/**
 * Email 2 — +24 hours
 * Purpose: Make Richflex feel inevitable, not optional
 */
export function getOnboardingEmail2(email: string): { subject: string; html: string } {
  const content = `
              <p style="margin: 0 0 24px 0;">
                Average doesn't get punished.<br>
                It gets ignored.
              </p>
              
              <p style="margin: 0 0 24px 0;">
                Ignored profiles.<br>
                Ignored messages.<br>
                Ignored brands.
              </p>
              
              <p style="margin: 0 0 24px 0;">
                That's why people who understand perception<br>
                don't argue about tools like Richflex.<br>
                They just use them.
              </p>
              
              <p style="margin: 0 0 32px 0;">
                If you haven't generated yet, do it once.<br>
                If you already did, you know why this exists.
              </p>
              
              <p style="margin: 0 0 8px 0; color: #666666;">
                Back here:
              </p>
              <p style="margin: 0;">
                <a href="${APP_URL}" style="color: #1a1a1a; text-decoration: underline;">${APP_URL}</a>
              </p>
  `;

  return {
    subject: "Average is invisible",
    html: getEmailWrapper(content, email),
  };
}

/**
 * Email 3 — Day 3 (72 hours)
 * Purpose: Connect usage to real-world outcomes
 */
export function getOnboardingEmail3(email: string): { subject: string; html: string } {
  const content = `
              <p style="margin: 0 0 24px 0;">
                Here's where Richflex shows up in real life:
              </p>
              
              <p style="margin: 0 0 24px 0; padding-left: 16px;">
                • dating profiles that suddenly get replies<br>
                • socials that stop looking amateur<br>
                • brands that look bigger than they are
              </p>
              
              <p style="margin: 0 0 24px 0;">
                Same person.<br>
                Same phone.<br>
                Different signal.
              </p>
              
              <p style="margin: 0 0 32px 0;">
                People don't upgrade Richflex for fun.<br>
                They upgrade because consistency changes how they're treated.
              </p>
              
              <p style="margin: 0 0 8px 0; color: #666666;">
                You already know where to go:
              </p>
              <p style="margin: 0;">
                <a href="${APP_URL}" style="color: #1a1a1a; text-decoration: underline;">${APP_URL}</a>
              </p>
  `;

  return {
    subject: "Where this actually pays off",
    html: getEmailWrapper(content, email),
  };
}

/**
 * Email 4 — Day 5 (120 hours)
 * Purpose: Draw the line, let them self-select (soft close, no discount)
 */
export function getOnboardingEmail4(email: string): { subject: string; html: string } {
  const content = `
              <p style="margin: 0 0 24px 0;">
                Last note from me.
              </p>
              
              <p style="margin: 0 0 24px 0;">
                At this point, one of two things is true:
              </p>
              
              <p style="margin: 0 0 24px 0; padding-left: 16px;">
                1) You don't care how you're perceived online<br>
                2) You do — and you want control over it
              </p>
              
              <p style="margin: 0 0 24px 0;">
                Richflex only makes sense for the second group.
              </p>
              
              <p style="margin: 0 0 32px 0;">
                If that's you, upgrading is obvious.<br>
                If it's not, you won't miss it.
              </p>
              
              <p style="margin: 0 0 8px 0; color: #666666;">
                Your call:
              </p>
              <p style="margin: 0;">
                <a href="${APP_URL}" style="color: #1a1a1a; text-decoration: underline;">${APP_URL}</a>
              </p>
  `;

  return {
    subject: "Decide how you want to show up",
    html: getEmailWrapper(content, email),
  };
}

/**
 * Get onboarding email by stage number
 */
export function getOnboardingEmail(
  stage: number,
  email: string
): { subject: string; html: string } | null {
  switch (stage) {
    case 0:
      return getOnboardingEmail0(email);
    case 1:
      return getOnboardingEmail1(email);
    case 2:
      return getOnboardingEmail2(email);
    case 3:
      return getOnboardingEmail3(email);
    case 4:
      return getOnboardingEmail4(email);
    default:
      return null;
  }
}
