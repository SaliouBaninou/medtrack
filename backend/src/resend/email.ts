import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const logoSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="40" viewBox="0 0 320 80" role="img" aria-label="MedTrack"><rect x="8" y="8" width="64" height="64" rx="19" fill="#0F766E"/><g transform="translate(28 28)" fill="none" stroke="#FFFFFF" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5"/><path d="M3.22 13H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27"/></g><text x="88" y="53" fill="#0F172A" font-family="Arial, Helvetica, sans-serif" font-size="35" font-weight="700" letter-spacing="-1.4">medtrack<tspan fill="#0F766E">.</tspan></text></svg>`;

type EmailOptions = {
  to: string;
  subject: string;
  heading: string;
  intro: string;
  code?: string;
  actionLabel?: string;
  actionUrl?: string;
  expiry: string;
};

export async function sendMedTrackEmail(options: EmailOptions) {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY n’est pas configurée.");
  }

  const codeBlock = options.code
    ? `<div style="margin:28px 0;padding:18px;background:#f0fdfa;border:1px solid #ccfbf1;border-radius:12px;text-align:center;font-size:32px;font-weight:700;letter-spacing:10px;color:#115e59">${options.code}</div>`
    : "";
  const actionBlock = options.actionUrl
    ? `<p style="margin:28px 0;text-align:center"><a href="${options.actionUrl}" style="display:inline-block;padding:14px 22px;background:#0f766e;color:#fff;text-decoration:none;border-radius:10px;font-weight:600">${options.actionLabel ?? "Continuer"}</a></p>`
    : "";
  const html = `<!doctype html><html lang="fr"><body style="margin:0;background:#f7faf9;font-family:Arial,sans-serif;color:#16312f"><div style="max-width:560px;margin:36px auto;padding:0 16px"><div style="padding:28px;background:#fff;border:1px solid #e2e8f0;border-radius:20px"><div style="display:block;width:160px;height:40px;margin-bottom:28px">${logoSvg}</div><p style="margin:0 0 10px;color:#0f766e;font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase">Votre espace de santé</p><h1 style="margin:0 0 16px;font-size:25px;line-height:1.3">${options.heading}</h1><p style="font-size:15px;line-height:1.7;color:#526563">${options.intro}</p>${codeBlock}${actionBlock}<p style="font-size:13px;line-height:1.6;color:#647472">${options.expiry}</p><hr style="margin:28px 0;border:0;border-top:1px solid #e2e8f0"><p style="margin:0;font-size:12px;color:#94a3a0">Si vous n’êtes pas à l’origine de cette demande, vous pouvez ignorer cet e-mail.</p></div><p style="text-align:center;font-size:12px;color:#94a3a0">© ${new Date().getFullYear()} MedTrack · Suivi et accompagnement des traitements</p></div></body></html>`;

  const { error } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL ?? "MedTrack <onboarding@resend.dev>",
    to: options.to,
    subject: options.subject,
    html,
  });
  if (error) throw new Error(`Échec de l’envoi Resend : ${error.message}`);
}

export async function sendOtpEmail({
  email,
  otp,
  type,
}: {
  email: string;
  otp: string;
  type: "sign-in" | "email-verification" | "forget-password" | "change-email";
}) {
  const reset = type === "forget-password";
  await sendMedTrackEmail({
    to: email,
    subject: reset ? "Votre code de réinitialisation MedTrack" : "Confirmez votre adresse e-mail MedTrack",
    heading: reset ? "Réinitialisez votre mot de passe" : "Confirmez votre adresse e-mail",
    intro: reset
      ? "Utilisez le code ci-dessous pour choisir un nouveau mot de passe."
      : "Utilisez ce code pour confirmer votre adresse et terminer la création de votre compte.",
    code: otp,
    expiry: "Ce code est valable pendant 10 minutes. Ne le partagez avec personne.",
  });
}

export async function sendPasswordResetEmail({
  to,
  url,
}: {
  to: string;
  url: string;
}) {
  await sendMedTrackEmail({
    to,
    subject: "Réinitialisez votre mot de passe MedTrack",
    heading: "Choisissez un nouveau mot de passe",
    intro: "Une demande de réinitialisation a été faite pour votre compte MedTrack.",
    actionLabel: "Réinitialiser mon mot de passe",
    actionUrl: url,
    expiry: "Ce lien est temporaire et ne peut être utilisé qu’une seule fois.",
  });
}
