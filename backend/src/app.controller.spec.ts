import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        {
          provide: PrismaService,
          useValue: { isConnected: () => Promise.resolve(true) },
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('health', () => {
    it('should report status ok and database connected', async () => {
      const health = await appController.getHealth();
      expect(health.status).toBe('ok');
      expect(health.database).toBe('connected');
      expect(typeof health.uptime).toBe('number');
      expect(typeof health.version).toBe('string');
    });
  });
});
