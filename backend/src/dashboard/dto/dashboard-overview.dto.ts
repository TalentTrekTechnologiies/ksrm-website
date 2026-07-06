import { ApiProperty } from '@nestjs/swagger';

export class DashboardWidgetDto {
  @ApiProperty({
    description:
      'The module/permission key this widget corresponds to (e.g. "faculty", "departments")',
    example: 'faculty',
  })
  key: string;

  @ApiProperty({ example: 'Faculty' })
  label: string;

  @ApiProperty({
    description:
      "Row count for this module. 0 if the underlying table has no rows yet, or if the table does not exist in this database yet (e.g. this schema's migrations have not been applied) - see `available`.",
    example: 42,
  })
  count: number;

  @ApiProperty({
    description:
      'False if this count could not be computed (e.g. the underlying table does not exist in this database yet). When false, `count` is reported as 0 rather than throwing, so the rest of the dashboard still loads.',
    example: true,
  })
  available: boolean;
}

export class DashboardOverviewResponseDto {
  @ApiProperty({
    type: [DashboardWidgetDto],
    description:
      'Only includes widgets the requesting admin has the corresponding `<key>.view` permission for (or all of them, if the admin is a super admin).',
  })
  widgets: DashboardWidgetDto[];

  @ApiProperty({ example: '2026-07-06T12:00:00.000Z' })
  generatedAt: string;
}
