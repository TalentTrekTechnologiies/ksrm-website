import {
  ArrayMinSize,
  IsArray,
  IsEmail,
  IsOptional,
  IsString,
  ValidateIf,
  Matches,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { IsPathOrUrl } from '../../dto/is-path-or-url.validator';

export class HelplinePhoneDto {
  @IsString()
  @MaxLength(20)
  display: string;

  // tel: links, not the path-or-url convention used elsewhere (IsPathOrUrl
  // deliberately doesn't accept this scheme) - a dedicated regex here since
  // this is the only field in the whole CMS that needs it.
  @Matches(/^tel:\+?[0-9]{7,15}$/, {
    message: 'href must be a tel: link, e.g. tel:+919000073434',
  })
  href: string;
}

/**
 * The admissions poster - the tall notice that leads the section.
 *
 * It used to be a file path compiled into the page, so every new season's
 * poster needed a developer and a deploy. Optional here because the saved
 * content of every existing site predates the field, and the public page
 * falls back to the shipped poster when it is absent.
 */
export class AdmissionsPosterDto {
  @IsPathOrUrl()
  url: string;

  /** Describes the poster for a screen reader. Blank is allowed. */
  @IsString()
  @MaxLength(150)
  alt: string;

  /**
   * Where the poster links to. Optional in every sense: left out, left blank,
   * it opens the poster image itself.
   *
   * ValidateIf, not IsOptional alone: an admin who opens the field, thinks
   * better of it and clears it sends an empty string, which is present as far
   * as IsOptional is concerned and would fail the path-or-URL check - so
   * saving the section would be refused over a field nobody wanted to fill in.
   */
  @ValidateIf((o: AdmissionsPosterDto) => o.href !== undefined && o.href !== '')
  @IsOptional()
  @IsPathOrUrl()
  href?: string;
}

export class AdmissionsContentDto {
  @IsString()
  @MaxLength(60)
  badge: string;

  @IsString()
  @MaxLength(150)
  heading: string;

  @IsString()
  @MaxLength(150)
  subtitle: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => HelplinePhoneDto)
  helplinePhones: HelplinePhoneDto[];

  @IsEmail()
  helplineEmail: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => AdmissionsPosterDto)
  poster?: AdmissionsPosterDto;
}
