import { ApiProperty } from '@nestjs/swagger';

export class StorageResponseDto {
  @ApiProperty({ example: 18874368, description: 'Total bytes used across all active Media Library files.' })
  usedBytes: number;

  @ApiProperty({
    example: 0,
    description: 'Always 0 today - no storage quota/capacity is configured anywhere yet.',
  })
  totalBytes: number;

  @ApiProperty({
    type: [Object],
    example: [{ type: 'IMAGE', count: 42 }],
    description: 'Per-type (IMAGE/VIDEO/DOCUMENT) file counts from the Media Library.',
  })
  breakdown: unknown[];

  @ApiProperty({
    example: 'Reflects the Media Library. totalBytes is 0 - no storage quota/capacity is configured anywhere yet.',
  })
  note: string;
}
