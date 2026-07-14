import { ArrayUnique, IsArray, IsInt } from 'class-validator';

export class AssignRolesDto {
  // Full replace, not incremental add/remove - the caller sends the
  // complete desired role set for the admin, matching how MediaField's
  // mediaId contract and every other "set" operation in this codebase
  // works (simpler to reason about than a diff).
  @IsArray()
  @ArrayUnique()
  @IsInt({ each: true })
  roleIds: number[];
}
