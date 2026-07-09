import { PartialType } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';
import { CreateHeroDto } from './create-hero.dto';

// PartialType (not "reuse the Create DTO for updates" like the older Faculty
// module) since Hero has many optional fields and PATCH here is a genuine
// partial update, not a full-record replace - see plan's DTO conventions
// note for the rationale.
export class UpdateHeroDto extends PartialType(CreateHeroDto) {
  // Required on every update - the optimistic-lock check needs the version
  // the client last saw. See homepage/optimistic-lock.util.ts.
  @IsInt()
  @Min(1)
  version: number;
}
