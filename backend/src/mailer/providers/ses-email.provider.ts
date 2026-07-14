import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SESv2Client, SendEmailCommand } from '@aws-sdk/client-sesv2';
import * as nodemailer from 'nodemailer';
import { EmailProvider, SendEmailParams } from '../interfaces/email-provider.interface';

// Nodemailer's built-in SES transport handles MIME composition
// (attachments, headers) the same way the SMTP provider does - only the
// transport target differs, so the rest of the codebase never needs to
// know it switched from SMTP to SES. Uses the modern SESv2Client +
// SendEmailCommand pair nodemailer v9's SES transport expects (not the
// legacy @aws-sdk/client-ses + SendRawEmailCommand shape).
@Injectable()
export class SesEmailProvider implements EmailProvider {
  private transporter: nodemailer.Transporter;

  constructor(private config: ConfigService) {
    const sesClient = new SESv2Client({
      region: this.config.get<string>('AWS_REGION', 'us-east-1'),
      // Falls back to the default AWS credential provider chain (IAM role,
      // shared config file, etc.) when these aren't set - never required
      // to hardcode credentials here.
      ...(this.config.get<string>('AWS_ACCESS_KEY_ID') && {
        credentials: {
          accessKeyId: this.config.get<string>('AWS_ACCESS_KEY_ID')!,
          secretAccessKey: this.config.get<string>('AWS_SECRET_ACCESS_KEY')!,
        },
      }),
    });

    this.transporter = nodemailer.createTransport({
      SES: { sesClient, SendEmailCommand },
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
