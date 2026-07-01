import "server-only";

import { Resend } from "resend";

import { env } from "@/lib/env";

const resend = env.authEmailEnabled ? new Resend(env.RESEND_API_KEY) : null;

function emailLayout(title: string, intro: string, ctaLabel: string, ctaUrl: string) {
  return `
    <div style="background:#f5f1ea;padding:32px 16px;font-family:Arial,sans-serif;color:#20180f;">
      <div style="max-width:560px;margin:0 auto;background:#fffdf9;border:1px solid #e6ddd1;border-radius:20px;overflow:hidden;">
        <div style="padding:32px;border-bottom:1px solid #efe7dc;background:linear-gradient(135deg,#f4e6d2 0%,#fff8ef 100%);">
          <p style="margin:0 0 8px 0;font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:#8f6b3d;">Brickex</p>
          <h1 style="margin:0;font-size:30px;line-height:1.1;">${title}</h1>
        </div>
        <div style="padding:32px;">
          <p style="margin:0 0 24px 0;font-size:16px;line-height:1.6;color:#3f3020;">${intro}</p>
          <a href="${ctaUrl}" style="display:inline-block;background:#a46b2a;color:#fff;text-decoration:none;padding:14px 22px;border-radius:999px;font-weight:600;">${ctaLabel}</a>
          <p style="margin:24px 0 0 0;font-size:13px;line-height:1.6;color:#7f6d58;">Si el boton no funciona, abre esta URL:<br /><a href="${ctaUrl}" style="color:#8f6b3d;word-break:break-all;">${ctaUrl}</a></p>
        </div>
      </div>
    </div>
  `;
}

async function sendEmail(to: string, subject: string, html: string) {
  if (!resend) {
    throw new Error("Resend no esta configurado");
  }

  await resend.emails.send({
    from: env.AUTH_FROM_EMAIL,
    to,
    subject,
    html,
  });
}

export async function sendVerificationEmail(to: string, url: string) {
  await sendEmail(
    to,
    "Verifica tu cuenta de Brickex",
    emailLayout(
      "Verifica tu correo",
      "Confirma tu direccion de correo para proteger tu cuenta de Brickex y activar el acceso al workspace compartido.",
      "Verificar correo",
      url,
    ),
  );
}

export async function sendMagicLinkEmail(to: string, url: string) {
  await sendEmail(
    to,
    "Tu enlace de acceso a Brickex",
    emailLayout(
      "Accede a Brickex",
      "Usa este enlace seguro para abrir Brickex o terminar de crear tu cuenta sin introducir una contrasena.",
      "Abrir Brickex",
      url,
    ),
  );
}

export async function sendResetPasswordEmail(to: string, url: string) {
  await sendEmail(
    to,
    "Restablece tu contrasena de Brickex",
    emailLayout(
      "Restablece tu contrasena",
      "Se solicito restablecer la contrasena de tu cuenta de Brickex. Si fuiste tu, continua con el enlace seguro de abajo.",
      "Restablecer contrasena",
      url,
    ),
  );
}
