import { ArrayMinSize, IsArray, IsIn, IsInt, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { QUICK_LINK_SECTIONS } from './create-quick-link.dto';
import type { QuickLinkSection } from './create-quick-link.dto';

class ReorderQuickLinkItemDto {
  @IsInt()
  id: number;

  @IsInt()
  @Min(0)
  sortOrder: number;
}

export class ReorderQuickLinksDto {
  @IsIn(QUICK_LINK_SECTIONS)
  section: QuickLinkSection;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ReorderQuickLinkItemDto)
  items: ReorderQuickLinkItemDto[];
}
