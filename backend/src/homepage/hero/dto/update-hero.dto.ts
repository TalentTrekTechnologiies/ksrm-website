import { OmitType, PartialType } from '@nestjs/swagger';
import { IsInt, IsOptional, Min } from 'class-validator';
import { CreateHeroDto } from './create-hero.dto';

// PartialType (not "reuse the Create DTO for updates" like the older Faculty
// module) since Hero has many optional fields and PATCH here is a genuine
// partial update, not a full-record replace - see plan's DTO conventions
// note for the rationale.
//
// mediaId is omitted from the base before PartialType is applied, then
// re-declared below with a wider `number | null` type - PartialType alone
// would keep it `number | undefined` (inherited from CreateHeroDto), which
// can't express "explicitly unlink".
export class UpdateHeroDto extends PartialType(OmitType(CreateHeroDto, ['mediaId'] as const)) {
  // Required on every update - the optimistic-lock check needs the version
  // the client last saw. See homepage/optimistic-lock.util.ts.
  @IsInt()
  @Min(1)
  version: number;

  // Pass `null` explicitly to unlink from the Media Library and fall back
  // to manually editing videoUrl again.
  @IsOptional()
  @IsInt()
  mediaId?: number | null;
}
