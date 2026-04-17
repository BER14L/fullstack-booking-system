/**
 * Email service — wraps Nodemailer.
 *
 * The transporter is lazy so missing SMTP config in dev doesn't explode the
 * process. If SMTP isn't configured, emails are logged to stdout instead —
 * handy for development without a provider.
 */
import nodemailer, { Transporter } from "nodemailer";
import { env } from "../config/env";
import { logger } from "../utils/logger";

let transporter: Transporter | null = null;

function getTransporter(): Transporter | null {
  if (transporter) return transporter;
  if (!env.SMTP_HOST) return null;

  transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: env.SMTP_USER
      ? { user: env.SMTP_USER, pass: env.SMTP_PASS }
      : undefined,
  });
  return transporter;
}

interface SendArgs {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(args: SendArgs): Promise<void> {
  const tx = getTransporter();
  if (!tx) {
    logger.warn("SMTP not configured — skipping email send", {
      to: args.to,
      subject: args.subject,
    });
    return;
  }
  await tx.sendMail({
    from: env.EMAIL_FROM,
    to: args.to,
    subject: args.subject,
    html: args.html,
    text: args.text ?? args.html.replace(/<[^>]+>/g, ""),
  });
}

export function bookingConfirmationTemplate(args: {
  userName: string;
  date: Date;
  startTime: Date;
  endTime: Date;
  bookingId: string;
}): { subject: string; html: string } {
  const fmt = (d: Date) =>
    d.toLocaleString("en-US", { dateStyle: "full", timeStyle: "short" });
  return {
    subject: `Your SmartReserve booking is confirmed`,
    html: `
      <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 560px; margin: auto; color: #111;">
        <h1 style="color:#4f46e5;">Booking confirmed</h1>
        <p>Hi ${args.userName},</p>
        <p>Your booking has been confirmed. Here are the details:</p>
        <table style="border-collapse:collapse;">
          <tr><td style="padding:6px 10px;"><strong>Date</strong></td><td>${fmt(args.date)}</td></tr>
          <tr><td style="padding:6px 10px;"><strong>Starts</strong></td><td>${fmt(args.startTime)}</td></tr>
          <tr><td style="padding:6px 10px;"><strong>Ends</strong></td><td>${fmt(args.endTime)}</td></tr>
          <tr><td style="padding:6px 10px;"><strong>Reference</strong></td><td>${args.bookingId}</td></tr>
        </table>
        <p style="margin-top:24px;">Thanks for choosing SmartReserve!</p>
      </div>
    `,
  };
}
