import { Inject, Injectable, Logger } from '@nestjs/common';
import { EMAIL_PROVIDER_TOKEN } from './interfaces/email-provider.interface';
import type {
  EmailProvider,
  SendEmailParams,
} from './interfaces/email-provider.interface';

// The one thing application code depends on. It never imports a concrete
// provider (SmtpEmailProvider/SesEmailProvider/ConsoleEmailProvider) -
// only this class and the generic `send()` shape. Swapping providers is
// entirely a MailerModule/config concern (EMAIL_PROVIDER env var).
@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @Inject(EMAIL_PROVIDER_TOKEN) private readonly provider: EmailProvider,
  ) {}

  // A failed email must never fail the request that triggered it (e.g. a
  // job application was already saved to the database - that's the
  // durable outcome; the notification is best-effort). Callers await this
  // for ordering but errors are swallowed here, not rethrown.
  async send(params: SendEmailParams): Promise<void> {
    try {
      await this.provider.send(params);
    } catch (err) {
      this.logger.error(
        `Failed to send email "${params.subject}" to ${[params.to].flat().join(', ')}: ${err instanceof Error ? err.message : err}`,
      );
    }
  }
}
