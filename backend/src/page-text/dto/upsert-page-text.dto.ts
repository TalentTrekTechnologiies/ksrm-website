import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsOptional,
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

  /**
   * Optional appearance for this one slot.
   *
   * Null clears it, which is not the same as an empty string: null puts the
   * slot back to the page's own styling, so an admin who set a colour by
   * mistake can undo it rather than being stuck with a value.
   *
   * Kept as free text and bounded rather than an enum - a colour is whatever
   * CSS accepts, and pinning it to a list here would mean a deployment every
   * time the college wanted a shade the list did not have. It is rendered
   * into a style attribute, never into markup, so it cannot carry HTML.
   */
  @IsOptional()
  @IsString()
  @MaxLength(32)
  fontSize?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  color?: string | null;
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
