import { ApiProperty } from '@nestjs/swagger';

export class RecentActivityItemDto {
  @ApiProperty({ example: 101 })
  id: number;

  @ApiProperty({ example: 'faculty' })
  module: string;

  @ApiProperty({ example: 'UPDATE', enum: ['CREATE', 'UPDATE', 'DELETE'] })
  action: string;

  @ApiProperty({ example: 7, nullable: true })
  targetId: number | null;

  @ApiProperty({ example: 'Super Administrator' })
  adminName: string;

  @ApiProperty({ example: '2026-07-06T11:45:00.000Z' })
  createdAt: string;
}

export class RecentActivityResponseDto {
  @ApiProperty({
    type: [RecentActivityItemDto],
    description:
      'Most recent audit-log entries across modules the requesting admin has `<module>.view` permission for (all modules, if a super admin). Empty if no matching activity exists yet, or if no module currently calls the audit logger (only faculty/news/gallery do today).',
  })
  items: RecentActivityItemDto[];
}
