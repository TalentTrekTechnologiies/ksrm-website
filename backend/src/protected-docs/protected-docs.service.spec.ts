import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { ProtectedDocsService } from './protected-docs.service';
import { PrismaService } from '../prisma/prisma.service';
import { STORAGE_ADAPTER } from '../media/storage/storage.constants';

/**
 * The page route has no login on it - reviewers are given a URL, not accounts -
 * so the token is the only thing standing between "a link that works for
 * fifteen minutes" and "permanent public URLs, walkable by id". These pin it.
 */
describe('ProtectedDocsService tokens', () => {
  let service: ProtectedDocsService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        ProtectedDocsService,
        { provide: PrismaService, useValue: {} },
        {
          provide: ConfigService,
          useValue: {
            get: (key: string) =>
              key === 'JWT_SECRET' ? 'test-secret' : './storage/media',
          },
        },
        { provide: STORAGE_ADAPTER, useValue: {} },
      ],
    }).compile();

    service = moduleRef.get(ProtectedDocsService);
  });

  it('accepts a token it just issued', () => {
    expect(service.verifyToken(7, service.issueToken(7))).toBe(true);
  });

  it('refuses a token issued for a different document', () => {
    // Otherwise one shared link opens every protected document on the site.
    expect(service.verifyToken(8, service.issueToken(7))).toBe(false);
  });

  it('refuses a missing or malformed token', () => {
    expect(service.verifyToken(7, undefined)).toBe(false);
    expect(service.verifyToken(7, '')).toBe(false);
    expect(service.verifyToken(7, 'nonsense')).toBe(false);
    expect(service.verifyToken(7, '9999999999999.')).toBe(false);
  });

  it('refuses a token whose signature has been edited', () => {
    const token = service.issueToken(7);
    const [expires, mac] = token.split('.');
    const tampered = `${expires}.${mac.slice(0, -1)}${mac.endsWith('A') ? 'B' : 'A'}`;
    expect(service.verifyToken(7, tampered)).toBe(false);
  });

  it('refuses a token whose expiry has been pushed out', () => {
    // The expiry is inside the signature, so extending it invalidates the MAC.
    const token = service.issueToken(7);
    const [, mac] = token.split('.');
    expect(service.verifyToken(7, `${Date.now() + 86_400_000}.${mac}`)).toBe(
      false,
    );
  });

  it('refuses an expired token', () => {
    const real = Date.now;
    try {
      const token = service.issueToken(7);
      Date.now = () => real() + 16 * 60 * 1000;
      expect(service.verifyToken(7, token)).toBe(false);
    } finally {
      Date.now = real;
    }
  });
});
