import { ApiProperty } from '@nestjs/swagger';

export class StorageResponseDto {
  @ApiProperty({ example: 0 })
  usedBytes: number;

  @ApiProperty({ example: 0 })
  totalBytes: number;

  @ApiProperty({
    type: [Object],
    example: [],
    description:
      'Always empty today - there is no file upload/storage subsystem anywhere in this backend (every "image"/"file" field across every module is a plain URL string with no server-side upload, storage backend, or size tracking - confirmed in the project handoff audit). This endpoint exists so the frontend is already wired to a real API and needs no changes once file storage is actually implemented.',
  })
  breakdown: unknown[];

  @ApiProperty({
    example:
      'No file upload/storage subsystem exists yet - see PROJECT_HANDOFF.md.',
  })
  note: string;
}
