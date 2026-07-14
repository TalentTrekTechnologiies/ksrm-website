import {
  Controller,
  Get,
  Patch,
  Body,
  Query,
  ParseIntPipe,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DepartmentDisplaySettingsService } from './department-display-settings.service';
import { SetDisplaySettingDto } from './dto/set-display-setting.dto';
import { BulkSetDisplaySettingsDto } from './dto/bulk-set-display-settings.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { RequirePermission } from '../auth/permission.decorator';
import { DepartmentOwnershipGuard } from '../auth/department-ownership.guard';
import { DepartmentScoped } from '../auth/department-scope.decorator';

@ApiTags('department-display-settings')
@Controller('department-display-settings')
export class DepartmentDisplaySettingsController {
  constructor(
    private readonly displaySettingsService: DepartmentDisplaySettingsService,
  ) {}

  @Get('catalog')
  getCatalog() {
    return this.displaySettingsService.getCatalog();
  }

  @Get()
  getEffectiveSettings(@Query('departmentId', ParseIntPipe) departmentId: number) {
    return this.displaySettingsService.getEffectiveSettings(departmentId);
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('department_display_settings.view')
  findAllAdmin(@Query('departmentId', ParseIntPipe) departmentId: number) {
    return this.displaySettingsService.findAllAdmin(departmentId);
  }

  @Patch()
  @UseGuards(JwtAuthGuard, PermissionsGuard, DepartmentOwnershipGuard)
  @RequirePermission('department_display_settings.update')
  @DepartmentScoped({ source: 'body' })
  set(@Body() dto: SetDisplaySettingDto, @Request() req) {
    return this.displaySettingsService.set(dto, req.user, req.requestId);
  }

  @Patch('bulk')
  @UseGuards(JwtAuthGuard, PermissionsGuard, DepartmentOwnershipGuard)
  @RequirePermission('department_display_settings.update')
  @DepartmentScoped({ source: 'body' })
  bulkSet(@Body() dto: BulkSetDisplaySettingsDto, @Request() req) {
    return this.displaySettingsService.bulkSet(dto, req.user, req.requestId);
  }
}
