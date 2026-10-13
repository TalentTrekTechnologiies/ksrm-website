import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { BulkCreateDownloadsDto } from './bulk-create-downloads.dto';
import { CreateDownloadDto } from './create-download.dto';

describe('download folderPath validation', () => {
  const folderPathErrors = (
    dto: new () => object,
    folderPath: string,
  ) =>
    validateSync(plainToInstance(dto, { folderPath })).find(
      (error) => error.property === 'folderPath',
    )?.constraints;

  it.each([CreateDownloadDto, BulkCreateDownloadsDto])(
    'accepts legacy-style nested folders for %p',
    (dto) => {
      expect(
        folderPathErrors(dto, 'AQAR/2023-24/Criterion1/CSP'),
      ).toBeUndefined();
    },
  );

  it.each([CreateDownloadDto, BulkCreateDownloadsDto])(
    'rejects malformed or traversing folder paths for %p',
    (dto) => {
      for (const path of ['../private', 'AQAR//Criterion1', 'AQAR\\Criterion1']) {
        expect(folderPathErrors(dto, path)).toBeDefined();
      }
    },
  );
});
