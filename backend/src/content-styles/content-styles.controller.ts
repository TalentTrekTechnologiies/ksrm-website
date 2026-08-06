import { Body, Controller, Get, Put, Query, Request, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ContentStylesService } from './content-styles.service';
import { UpsertContentStylesDto } from './dto/content-style.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { RequirePermission } from '../auth/permission.decorator';

/**
 * Gated on downloads.update, the same permission Page Content's text and
 * tables use. Splitting it would mean an admin could edit an item's wording
 * but not its appearance, which is one control in the same form.
 */
@ApiTags('content-styles')
@Controller('content-styles')
export class ContentStylesController {
  constructor(private readonly service: ContentStylesService) {}

  @Get()
  findAllPublic(@Query('module') module?: string) {
    return this.service.findAllPublic(module);
  }

  @Put()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('downloads.update')
  upsert(@Body() dto: UpsertContentStylesDto, @Request() req) {
    return this.service.upsert(dto, req.user, req.requestId);
  }
}
