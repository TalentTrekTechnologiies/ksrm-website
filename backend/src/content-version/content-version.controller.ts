import { Controller, Get, Header } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { ApiTags } from '@nestjs/swagger';
import { getContentVersion } from './content-version.state';

/**
 * "Has anything changed?" - the endpoint the public site polls so edits appear
 * almost immediately without every section re-fetching on a timer.
 *
 * Public and unauthenticated: it exposes a counter and a timestamp, nothing
 * about the content itself.
 */
@ApiTags('content-version')
@Controller('content-version')
export class ContentVersionController {
  /**
   * Skips the throttler on purpose. This is polled every couple of seconds by
   * every open tab, which is exactly the traffic the limiter exists to stop -
   * but here it is the intended design, and the handler touches neither the
   * database nor the disk.
   */
  @SkipThrottle()
  @Get()
  // Must never be cached, or a stale copy would hide the very change it exists
  // to announce.
  @Header('Cache-Control', 'no-store, no-cache, must-revalidate')
  get() {
    return getContentVersion();
  }
}
