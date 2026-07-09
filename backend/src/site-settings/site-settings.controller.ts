import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  ParseIntPipe,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SiteSettingsService } from './site-settings.service';
import { CreateSiteSettingDto } from './dto/create-site-setting.dto';
import { UpdateSiteSettingDto } from './dto/update-site-setting.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { RequirePermission } from '../auth/permission.decorator';

// Admin-only config table - no public route (unlike every content module).
@ApiTags('site-settings')
@Controller('site-settings')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class SiteSettingsController {
  constructor(private readonly siteSettingsService: SiteSettingsService) {}

  @Get()
  @RequirePermission('site_settings.view')
  findAll(@Query('group') group?: string) {
    return this.siteSettingsService.findAll(group);
  }

  @Post()
  @RequirePermission('site_settings.create')
  create(@Body() dto: CreateSiteSettingDto, @Request() req) {
    return this.siteSettingsService.create(dto, req.user, req.requestId);
  }

  @Patch(':id')
  @RequirePermission('site_settings.update')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateSiteSettingDto, @Request() req) {
    return this.siteSettingsService.update(id, dto, req.user, req.requestId);
  }

  @Delete(':id')
  @RequirePermission('site_settings.delete')
  delete(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.siteSettingsService.delete(id, req.user, req.requestId);
  }
}
