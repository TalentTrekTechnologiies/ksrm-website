import { Test, TestingModule } from '@nestjs/testing';
import { NotificationService } from './notification.service';
import { EMAIL_PROVIDER_TOKEN } from './interfaces/email-provider.interface';

describe('NotificationService', () => {
  let service: NotificationService;
  let provider: { send: jest.Mock };

  beforeEach(async () => {
    provider = { send: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        { provide: EMAIL_PROVIDER_TOKEN, useValue: provider },
      ],
    }).compile();

    service = module.get(NotificationService);
  });

  it('delegates to the injected provider', async () => {
    provider.send.mockResolvedValue(undefined);

    await service.send({ to: 'a@b.com', subject: 'Hi', html: '<p>Hi</p>' });

    expect(provider.send).toHaveBeenCalledWith(
      expect.objectContaining({ to: 'a@b.com', subject: 'Hi' }),
    );
  });

  it('swallows provider failures instead of throwing - a broken email provider must never fail the request that triggered it', async () => {
    provider.send.mockRejectedValue(new Error('SMTP connection refused'));

    await expect(
      service.send({ to: 'a@b.com', subject: 'Hi', html: '<p>Hi</p>' }),
    ).resolves.toBeUndefined();
  });
});
