import { IsString, MaxLength, MinLength } from 'class-validator';

export class HeartbeatDto {
  /** A random id the frontend generates per browser tab (not a person, not
   *  tied to any account) - just enough to dedupe one tab's repeated pings
   *  into a single "live" row. */
  @IsString()
  @MinLength(8)
  @MaxLength(100)
  id: string;
}
