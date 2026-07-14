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
import { SendTestEmailDto } from './dto/send-test-email.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { RequirePermission } from '../auth/permission.decorator';

@ApiTags('site-settings')
@Controller('site-settings')
export class SiteSettingsController {
  constructor(private readonly siteSettingsService: SiteSettingsService) {}

  // Public counterpart of the admin list below - only rows with
  // isPublic:true, key/value only. Registered before the guarded admin
  // routes at the class level used to make this whole controller
  // admin-only; now guards are per-route so this one stays open, matching
  // every other module's public/admin route-pair convention.
  @Get('public')
  findAllPublic(@Query('group') group?: string) {
    return this.siteSettingsService.findAllPublic(group);
  }

  @Get()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('site_settings.view')
  findAll(@Query('group') group?: string) {
    return this.siteSettingsService.findAll(group);
  }

  @Get('system-info')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('site_settings.view')
  getSystemInfo() {
    return this.siteSettingsService.getSystemInfo();
  }

  @Post('test-email')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('site_settings.update')
  sendTestEmail(@Body() dto: SendTestEmailDto, @Request() req) {
    return this.siteSettingsService.sendTestEmail(dto.to, req.user, req.requestId);
  }

  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('site_settings.create')
  create(@Body() dto: CreateSiteSettingDto, @Request() req) {
    return this.siteSettingsService.create(dto, req.user, req.requestId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('site_settings.update')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateSiteSettingDto, @Request() req) {
    return this.siteSettingsService.update(id, dto, req.user, req.requestId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('site_settings.delete')
  delete(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.siteSettingsService.delete(id, req.user, req.requestId);
  }
}
