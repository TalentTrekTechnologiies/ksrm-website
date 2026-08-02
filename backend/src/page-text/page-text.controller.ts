import {
  Body,
  Controller,
  Delete,
  Get,
  Put,
  Param,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PageTextService } from './page-text.service';
import { UpsertPageTextDto } from './dto/upsert-page-text.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { RequirePermission } from '../auth/permission.decorator';

/**
 * Page text overrides. Gated on the `downloads.*` permissions rather than a
 * module of its own, matching PageTables: both are edited from the Page
 * Content screen, and splitting the permission would mean an admin could reach
 * that screen but only half of it.
 */
@ApiTags('page-text')
@Controller('page-text')
export class PageTextController {
  constructor(private readonly service: PageTextService) {}

  /** Public: the overrides a page applies to its own wording. */
  @Get()
  findAllPublic(@Query('pageSection') pageSection?: string) {
    return this.service.findAllPublic(pageSection);
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('downloads.view')
  findAllAdmin(@Query('pageSection') pageSection?: string) {
    return this.service.findAllAdmin(pageSection);
  }

  /** Saves a page's edits in one request. */
  @Put()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('downloads.update')
  upsert(@Body() dto: UpsertPageTextDto, @Request() req) {
    return this.service.upsert(dto, req.user, req.requestId);
  }

  /** Removes one override, restoring the page's built-in wording. */
  @Delete(':key')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('downloads.update')
  reset(@Param('key') key: string, @Request() req) {
    return this.service.reset(key, req.user, req.requestId);
  }
}
