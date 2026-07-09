import {
  ArrayMinSize,
  IsArray,
  IsEmail,
  IsString,
  Matches,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

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
}
