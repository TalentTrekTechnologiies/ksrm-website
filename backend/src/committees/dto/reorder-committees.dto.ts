import { IsArray, IsInt } from 'class-validator';

/**
 * The complete list of ids in their new order; array position becomes
 * sortOrder. The service rejects a partial list - see `assertSameSet`.
 */
export class ReorderCommitteesDto {
  @IsArray()
  @IsInt({ each: true })
  ids: number[];
}
