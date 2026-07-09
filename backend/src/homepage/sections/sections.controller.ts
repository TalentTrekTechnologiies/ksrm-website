import { Body, Controller, Get, Param, Patch, Request, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SectionsService } from './sections.service';
import {
  UpdateVisionSectionDto,
  UpdateMissionSectionDto,
  UpdateAboutSectionDto,
  UpdateAdmissionsSectionDto,
} from './dto/update-section.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { PermissionsGuard } from '../../auth/permissions.guard';
import { RequirePermission } from '../../auth/permission.decorator';

@ApiTags('homepage-sections')
@Controller('homepage')
export class SectionsController {
  constructor(private readonly sectionsService: SectionsService) {}

  @Get('sections/:key')
  findPublicByKey(@Param('key') key: string) {
    return this.sectionsService.findPublicByKey(key);
  }

  @Get('admin/sections')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('homepage.view')
  findAllAdmin() {
    return this.sectionsService.findAllAdmin();
  }

  @Get('admin/sections/:key')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('homepage.view')
  findAdminByKey(@Param('key') key: string) {
    return this.sectionsService.findAdminByKey(key);
  }

  // One PATCH route per key (not /admin/sections/:key) so each gets its own
  // strongly-typed, validated content DTO - see update-section.dto.ts.

  @Patch('admin/sections/vision')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('homepage.edit')
  updateVision(@Body() dto: UpdateVisionSectionDto, @Request() req) {
    return this.sectionsService.update('vision', dto.content, dto.status, dto.version, req.user, req.requestId);
  }

  @Patch('admin/sections/mission')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('homepage.edit')
  updateMission(@Body() dto: UpdateMissionSectionDto, @Request() req) {
    return this.sectionsService.update('mission', dto.content, dto.status, dto.version, req.user, req.requestId);
  }

  @Patch('admin/sections/about')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('homepage.edit')
  updateAbout(@Body() dto: UpdateAboutSectionDto, @Request() req) {
    return this.sectionsService.update('about', dto.content, dto.status, dto.version, req.user, req.requestId);
  }

  @Patch('admin/sections/admissions')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('homepage.edit')
  updateAdmissions(@Body() dto: UpdateAdmissionsSectionDto, @Request() req) {
    return this.sectionsService.update('admissions', dto.content, dto.status, dto.version, req.user, req.requestId);
  }
}
