import nodemailer from "nodemailer";
import { IMailerService, SendEmailPayload, SendEmailResult } from "@/lib/interfaces/mailer.interface";

export class NodemailerService implements IMailerService {
  async send(payload: SendEmailPayload): Promise<SendEmailResult> {
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT) || 465;
    const secure = process.env.SMTP_SECURE === "true" || port === 465;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    // If SMTP credentials are not configured, skip silently as per design requirement
    if (!host || !user || !pass) {
      console.log(
        "[Mailer] SMTP environment variables not configured. Skipping email notification gracefully."
      );
      return {
        success: true,
        messageId: "skipped_unconfigured",
      };
    }

    try {
      const transporter = nodemailer.createTransport({
        host,
        port,
        secure,
        auth: {
          user,
          pass,
        },
        connectionTimeout: 5000,
        greetingTimeout: 5000,
      });

      const info = await transporter.sendMail({
        from: `"${process.env.SMTP_FROM_NAME || "Shri Vinayaka Temple"}" <${user}>`,
        to: payload.to,
        subject: payload.subject,
        text: payload.text,
        html: payload.html,
      });

      return {
        success: true,
        messageId: info.messageId,
      };
    } catch (err: unknown) {
      // Non-blocking: log the error and never throw to the user
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error("[Mailer Error - Non-Blocking]", errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    }
  }
}

export const mailerService = new NodemailerService();
