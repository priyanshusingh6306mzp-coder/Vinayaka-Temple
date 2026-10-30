export interface SendEmailPayload {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface IMailerService {
  /**
   * Send an email. Failures must be non-blocking and safe to ignore.
   */
  send(payload: SendEmailPayload): Promise<SendEmailResult>;
}
