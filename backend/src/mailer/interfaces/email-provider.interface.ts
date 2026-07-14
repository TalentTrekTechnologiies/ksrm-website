// The abstraction every application service depends on - never a concrete
// provider. Swapping console -> SMTP -> SES is a config change
// (EMAIL_PROVIDER env var), not an application code change.
export interface EmailAttachment {
  filename: string;
  content: Buffer;
  contentType?: string;
}

export interface SendEmailParams {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  attachments?: EmailAttachment[];
  replyTo?: string;
}

export interface EmailProvider {
  send(params: SendEmailParams): Promise<void>;
}

// DI token (distinct from the EMAIL_PROVIDER env var that selects which
// implementation gets bound to it - see mailer.module.ts).
export const EMAIL_PROVIDER_TOKEN = 'EMAIL_PROVIDER_TOKEN';
