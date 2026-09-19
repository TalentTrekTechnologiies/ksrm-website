import {
  ArrayMinSize,
  IsArray,
  IsEmail,
  IsOptional,
  IsString,
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

  @IsString()
  @MaxLength(150)
  alt: string;

  /** Where the poster links to. Defaults to opening the image itself. */
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
