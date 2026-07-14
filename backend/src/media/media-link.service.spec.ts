import { Test, TestingModule } from '@nestjs/testing';
import { MediaLinkService } from './media-link.service';
import { MediaResolverService } from './media-resolver.service';
import { MediaUsageService } from './media-usage.service';

describe('MediaLinkService', () => {
  let service: MediaLinkService;
  let mediaResolver: { assertUsable: jest.Mock; buildFileUrl: jest.Mock };
  let mediaUsage: { track: jest.Mock; untrack: jest.Mock; untrackAll: jest.Mock };

  beforeEach(async () => {
    mediaResolver = {
      assertUsable: jest.fn().mockResolvedValue(undefined),
      buildFileUrl: jest.fn().mockReturnValue('http://localhost:4000/media/file/9/ORIGINAL/SOURCE'),
    };
    mediaUsage = {
      track: jest.fn().mockResolvedValue(undefined),
      untrack: jest.fn().mockResolvedValue(undefined),
      untrackAll: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MediaLinkService,
        { provide: MediaResolverService, useValue: mediaResolver },
        { provide: MediaUsageService, useValue: mediaUsage },
      ],
    }).compile();

    service = module.get(MediaLinkService);
  });

  describe('prepareLink', () => {
    it('returns undefined without touching the resolver when mediaId is undefined (field not part of this request)', async () => {
      await expect(service.prepareLink(undefined, 'IMAGE')).resolves.toBeUndefined();
      expect(mediaResolver.assertUsable).not.toHaveBeenCalled();
    });

    it('returns undefined without touching the resolver when mediaId is null (explicit unlink)', async () => {
      await expect(service.prepareLink(null, 'IMAGE')).resolves.toBeUndefined();
      expect(mediaResolver.assertUsable).not.toHaveBeenCalled();
    });

    it('validates the type and builds the URL deterministically when a real mediaId is given', async () => {
      const url = await service.prepareLink(9, 'IMAGE');
      expect(mediaResolver.assertUsable).toHaveBeenCalledWith(9, 'IMAGE');
      expect(mediaResolver.buildFileUrl).toHaveBeenCalledWith(9, 'ORIGINAL', 'SOURCE');
      expect(url).toBe('http://localhost:4000/media/file/9/ORIGINAL/SOURCE');
    });

    it('propagates a rejection (e.g. wrong type) from assertUsable', async () => {
      mediaResolver.assertUsable.mockRejectedValue(new Error('wrong type'));
      await expect(service.prepareLink(9, 'VIDEO')).rejects.toThrow('wrong type');
    });
  });

  describe('syncUsage', () => {
    it('does nothing when mediaId is undefined', async () => {
      await service.syncUsage('gallery', 5, 'imageUrl', undefined);
      expect(mediaUsage.track).not.toHaveBeenCalled();
      expect(mediaUsage.untrack).not.toHaveBeenCalled();
    });

    it('untracks when mediaId is explicitly null', async () => {
      await service.syncUsage('gallery', 5, 'imageUrl', null);
      expect(mediaUsage.untrack).toHaveBeenCalledWith('gallery', 5, 'imageUrl');
      expect(mediaUsage.track).not.toHaveBeenCalled();
    });

    it('tracks when mediaId is a real id', async () => {
      await service.syncUsage('gallery', 5, 'imageUrl', 9);
      expect(mediaUsage.track).toHaveBeenCalledWith(9, 'gallery', 5, 'imageUrl');
      expect(mediaUsage.untrack).not.toHaveBeenCalled();
    });
  });

  describe('untrackAll', () => {
    it('delegates to MediaUsageService.untrackAll', async () => {
      await service.untrackAll('gallery', 5);
      expect(mediaUsage.untrackAll).toHaveBeenCalledWith('gallery', 5);
    });
  });
});
