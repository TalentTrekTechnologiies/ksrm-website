import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NotificationService } from './notification.service';
import { EMAIL_PROVIDER_TOKEN } from './interfaces/email-provider.interface';
import { ConsoleEmailProvider } from './providers/console-email.provider';
import { SmtpEmailProvider } from './providers/smtp-email.provider';
import { SesEmailProvider } from './providers/ses-email.provider';

// Provider selection is entirely config-driven (EMAIL_PROVIDER env var) -
// this factory is the ONLY place that knows about concrete provider
// classes. Everything else in the app depends on NotificationService alone.
@Module({
  providers: [
    {
      provide: EMAIL_PROVIDER_TOKEN,
      useFactory: (config: ConfigService) => {
        const provider = config.get<string>('EMAIL_PROVIDER', 'console');
        switch (provider) {
          case 'smtp':
            return new SmtpEmailProvider(config);
          case 'ses':
            return new SesEmailProvider(config);
          case 'console':
            return new ConsoleEmailProvider();
          default:
            throw new Error(
              `Unknown EMAIL_PROVIDER "${provider}" - expected "console", "smtp", or "ses".`,
            );
        }
      },
      inject: [ConfigService],
    },
    NotificationService,
  ],
  exports: [NotificationService],
})
export class MailerModule {}
