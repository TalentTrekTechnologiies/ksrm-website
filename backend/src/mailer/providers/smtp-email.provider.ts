import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import {
  EmailProvider,
  SendEmailParams,
} from '../interfaces/email-provider.interface';

// Works for both dev targets (Gmail SMTP and Mailpit) - both are plain SMTP,
// the only difference is config (Mailpit needs no auth, a local host/port;
// Gmail needs real credentials and TLS). Same code path, config-driven.
@Injectable()
export class SmtpEmailProvider implements EmailProvider {
  private transporter: nodemailer.Transporter;

  constructor(private config: ConfigService) {
    const user = this.config.get<string>('SMTP_USER');
    const pass = this.config.get<string>('SMTP_PASS');

    this.transporter = nodemailer.createTransport({
      host: this.config.get<string>('SMTP_HOST', 'localhost'),
      port: this.config.get<number>('SMTP_PORT', 1025),
      secure: this.config.get<string>('SMTP_SECURE', 'false') === 'true',
      // Mailpit needs no auth at all - only pass credentials when both are
      // configured (Gmail SMTP requires them).
      auth: user && pass ? { user, pass } : undefined,
    });
  }

  async send(params: SendEmailParams): Promise<void> {
    await this.transporter.sendMail({
      from: this.config.get<string>('EMAIL_FROM', 'no-reply@ksrmce.ac.in'),
      to: params.to,
      subject: params.subject,
      html: params.html,
      text: params.text,
      replyTo: params.replyTo,
      attachments: params.attachments?.map((a) => ({
        filename: a.filename,
        content: a.content,
        contentType: a.contentType,
      })),
    });
  }
}
