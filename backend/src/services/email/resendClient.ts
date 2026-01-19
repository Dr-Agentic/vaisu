import { Resend } from "resend";
import { env } from "../../config/env.js";

export class ResendClient {
  private resend: Resend;
  private fromAddress: string;
  private appUrl: string;

  constructor() {
    if (!env.RESEND_API_KEY) {
      console.warn(
        "WARNING: RESEND_API_KEY is not set. Email sending will fail.",
      );
    }
    this.resend = new Resend(env.RESEND_API_KEY);
    this.fromAddress = env.EMAIL_FROM;
    this.appUrl = env.APP_URL;
  }

  /**
   * Send a generic email
   */
  async sendEmail(to: string, subject: string, html: string, text?: string) {
    try {
      if (!env.RESEND_API_KEY) {
        throw new Error("RESEND_API_KEY is missing configuration");
      }

      const { data, error } = await this.resend.emails.send({
        from: this.fromAddress,
        to,
        subject,
        html,
        text: text || html.replace(/<[^>]*>?/gm, ""), // Simple strip tags fallback
      });

      if (error) {
        console.error(
          `[Email Error] Failed to send email to ${to}. Reason: ${error.message} (Type: ${error.name})`,
        );
        throw new Error(`Resend Error: ${error.message}`);
      }

      console.log(`Email sent to ${to}, ID: ${data?.id}`);
      return data;
    } catch (error: any) {
      // If it's the error we just threw, it's already logged. If it's a network/other error, log it.
      if (!error.message?.startsWith("Resend Error:")) {
        console.error(
          `[Email Error] Unexpected failure sending to ${to}. Reason: ${error.message || error}`,
        );
      }
      throw error;
    }
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(to: string, resetToken: string) {
    const resetLink = `${this.appUrl}/reset-password?token=${resetToken}`;

    const subject = "Reset your Vaisu password";
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Reset Password</h2>
        <p>You have requested to reset your password for Vaisu.</p>
        <p>Click the link below to reset it:</p>
        <p>
          <a href="${resetLink}" style="display: inline-block; background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
        </p>
        <p style="color: #666; font-size: 14px;">Or copy this link: ${resetLink}</p>
        <p>If you didn't request this, please ignore this email.</p>
      </div>
    `;

    return this.sendEmail(to, subject, html);
  }
}

let clientInstance: ResendClient | null = null;

export function getResendClient(): ResendClient {
  if (!clientInstance) {
    clientInstance = new ResendClient();
  }
  return clientInstance;
}
