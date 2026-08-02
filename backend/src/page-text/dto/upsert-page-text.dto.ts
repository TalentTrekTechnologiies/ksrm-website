import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';

// Generous, but bounded: these are page paragraphs, not articles. Anything
// longer belongs in a document upload.
const MAX_VALUE = 20_000;

export class UpsertPageTextItemDto {
  /** Slot identifier from the frontend registry, e.g. "library.about.p1". */
  @IsString()
  @MaxLength(160)
  key: string;

  @IsString()
  @MaxLength(160)
  pageSection: string;

  /**
   * An empty string is meaningful - it blanks the slot on the page. Clearing
   * an override back to the page's built-in wording is DELETE, not an empty
   * value.
   */
  @IsString()
  @MaxLength(MAX_VALUE)
  value: string;
}

/** Saves a whole page's edits in one request, so one Save means one save. */
export class UpsertPageTextDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(300)
  @ValidateNested({ each: true })
  @Type(() => UpsertPageTextItemDto)
  items: UpsertPageTextItemDto[];
}
