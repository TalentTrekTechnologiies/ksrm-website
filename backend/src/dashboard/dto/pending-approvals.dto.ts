import { ApiProperty } from '@nestjs/swagger';

export class PendingApprovalsResponseDto {
  @ApiProperty({
    type: [Object],
    example: [],
    description:
      'Always empty today - there is no draft/review/approval workflow anywhere in the current data model (no content entity has a pending/approved/rejected status). This endpoint exists so the frontend is already wired to a real API and needs no changes once such a workflow is designed and built.',
  })
  items: unknown[];

  @ApiProperty({ example: 0 })
  count: number;

  @ApiProperty({
    example:
      'No approval workflow exists in the data model yet - see DATA_MODEL_DESIGN.md.',
  })
  note: string;
}
