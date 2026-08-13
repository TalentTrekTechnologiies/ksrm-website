import { Injectable, Logger } from '@nestjs/common';
import {
  EmailProvider,
  SendEmailParams,
} from '../interfaces/email-provider.interface';

// Zero-config default: logs instead of sending. Used whenever EMAIL_PROVIDER
// is unset (local dev with no SMTP/SES credentials, CI, tests) so the app
// never hard-fails on a missing email provider - it just becomes visible in
// the logs that an email "would have been sent".
@Injectable()
export class ConsoleEmailProvider implements EmailProvider {
  private readonly logger = new Logger(ConsoleEmailProvider.name);

  async send(params: SendEmailParams): Promise<void> {
    this.logger.log(
      `[console email provider] To: ${[params.to].flat().join(', ')} | Subject: ${params.subject}` +
        (params.attachments?.length
          ? ` | Attachments: ${params.attachments.map((a) => a.filename).join(', ')}`
          : ''),
    );
    this.logger.debug(params.html);
  }
}
