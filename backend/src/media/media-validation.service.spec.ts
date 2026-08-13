import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { fromFile } from 'file-type';
import { MediaValidationService } from './media-validation.service';
import { MediaSettingsService } from './media-settings.service';

jest.mock('file-type', () => ({ fromFile: jest.fn() }));

function multerFile(
  overrides: Partial<Express.Multer.File>,
): Express.Multer.File {
  return {
    fieldname: 'file',
    originalname: 'test.png',
    encoding: '7bit',
    mimetype: 'image/png',
    size: 1000,
    destination: '',
    filename: '',
    path: '',
    buffer: Buffer.from(''),
    stream: null as never,
    ...overrides,
  };
}

describe('MediaValidationService', () => {
  let service: MediaValidationService;
  let mediaSettings: { getMaxSizeBytes: jest.Mock };
  let tmpDir: string;

  beforeAll(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'media-validation-spec-'));
  });

  afterAll(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  beforeEach(async () => {
    mediaSettings = {
      getMaxSizeBytes: jest.fn().mockResolvedValue(25 * 1024 * 1024),
    };
    (fromFile as jest.Mock).mockReset();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MediaValidationService,
        { provide: MediaSettingsService, useValue: mediaSettings },
      ],
    }).compile();

    service = module.get(MediaValidationService);
  });

  function writeTempFile(name: string, content: string | Buffer): string {
    const filePath = path.join(tmpDir, name);
    fs.writeFileSync(filePath, content);
    return filePath;
  }

  describe('extension allowlist', () => {
    it('rejects a disallowed extension like .exe outright', async () => {
      const filePath = writeTempFile('bad.exe', 'MZ');
      const file = multerFile({
        originalname: 'bad.exe',
        mimetype: 'application/octet-stream',
        path: filePath,
      });

      await expect(service.validate(file)).rejects.toBeInstanceOf(
        BadRequestException,
      );
      expect(fromFile).not.toHaveBeenCalled();
    });

    it('rejects a bare .zip even though DOCX/XLSX/PPTX are ZIP containers', async () => {
      const filePath = writeTempFile('archive.zip', 'PK');
      const file = multerFile({
        originalname: 'archive.zip',
        mimetype: 'application/zip',
        path: filePath,
      });

      await expect(service.validate(file)).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });
  });

  describe('declared MIME vs extension', () => {
    it('rejects when the declared MIME type does not match the extension', async () => {
      const filePath = writeTempFile('test.png', 'irrelevant');
      const file = multerFile({
        originalname: 'test.png',
        mimetype: 'image/gif',
        path: filePath,
      });

      await expect(service.validate(file)).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });
  });

  describe('size limits', () => {
    it('rejects a file larger than the configured per-type limit', async () => {
      mediaSettings.getMaxSizeBytes.mockResolvedValue(100);
      const filePath = writeTempFile('test.png', 'irrelevant');
      const file = multerFile({
        originalname: 'test.png',
        mimetype: 'image/png',
        size: 200,
        path: filePath,
      });

      await expect(service.validate(file)).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });
  });

  describe('magic bytes', () => {
    it('rejects when the sniffed content does not match the claimed extension (renamed file)', async () => {
      (fromFile as jest.Mock).mockResolvedValue({
        ext: 'gif',
        mime: 'image/gif',
      });
      const filePath = writeTempFile('test.png', 'irrelevant');
      const file = multerFile({
        originalname: 'test.png',
        mimetype: 'image/png',
        path: filePath,
      });

      await expect(service.validate(file)).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });

    it('rejects a DOCX whose content only sniffs as generic application/zip', async () => {
      (fromFile as jest.Mock).mockResolvedValue({
        ext: 'zip',
        mime: 'application/zip',
      });
      const filePath = writeTempFile('test.docx', 'PK');
      const file = multerFile({
        originalname: 'test.docx',
        mimetype:
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        path: filePath,
      });

      await expect(service.validate(file)).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });

    it('accepts a file whose sniffed content matches its extension', async () => {
      (fromFile as jest.Mock).mockResolvedValue({
        ext: 'png',
        mime: 'image/png',
      });
      const filePath = writeTempFile('test.png', 'irrelevant');
      const file = multerFile({
        originalname: 'test.png',
        mimetype: 'image/png',
        path: filePath,
      });

      await expect(service.validate(file)).resolves.toEqual({
        type: 'IMAGE',
        extension: 'png',
      });
    });
  });

  describe('SVG safety', () => {
    it('rejects an SVG containing an inline <script>', async () => {
      const filePath = writeTempFile(
        'evil.svg',
        '<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>',
      );
      const file = multerFile({
        originalname: 'evil.svg',
        mimetype: 'image/svg+xml',
        path: filePath,
      });

      await expect(service.validate(file)).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });

    it('rejects an SVG with an inline event-handler attribute', async () => {
      const filePath = writeTempFile(
        'evil.svg',
        '<svg xmlns="http://www.w3.org/2000/svg" onload="alert(1)"><circle r="1" /></svg>',
      );
      const file = multerFile({
        originalname: 'evil.svg',
        mimetype: 'image/svg+xml',
        path: filePath,
      });

      await expect(service.validate(file)).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });

    it('accepts a plain, safe SVG without running it through magic-byte sniffing', async () => {
      const filePath = writeTempFile(
        'logo.svg',
        '<svg xmlns="http://www.w3.org/2000/svg"><circle r="1" /></svg>',
      );
      const file = multerFile({
        originalname: 'logo.svg',
        mimetype: 'image/svg+xml',
        path: filePath,
      });

      await expect(service.validate(file)).resolves.toEqual({
        type: 'IMAGE',
        extension: 'svg',
      });
      expect(fromFile).not.toHaveBeenCalled();
    });
  });
});
