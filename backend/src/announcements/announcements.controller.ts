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
import { AnnouncementLocation } from '@prisma/client';
import { AnnouncementsService } from './announcements.service';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { UpdateAnnouncementDto } from './dto/update-announcement.dto';
import { QueryAnnouncementsAdminDto } from './dto/query-announcements.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { RequirePermission } from '../auth/permission.decorator';

@ApiTags('announcements')
@Controller('announcements')
export class AnnouncementsController {
  constructor(private readonly announcementsService: AnnouncementsService) {}

  @Get()
  findAllPublic(
    @Query('location') location: AnnouncementLocation,
    @Query('departmentId') departmentId?: string,
  ) {
    return this.announcementsService.findAllPublic(
      location,
      departmentId ? parseInt(departmentId) : undefined,
    );
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('announcements.view')
  findAllAdmin(@Query() query: QueryAnnouncementsAdminDto) {
    return this.announcementsService.findAllAdmin(query);
  }

  @Get('admin/:id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('announcements.view')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.announcementsService.findOne(id);
  }

  @Post('admin')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('announcements.create')
  create(@Body() dto: CreateAnnouncementDto, @Request() req) {
    return this.announcementsService.create(dto, req.user, req.requestId);
  }

  @Patch('admin/:id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('announcements.update')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAnnouncementDto,
    @Request() req,
  ) {
    return this.announcementsService.update(id, dto, req.user, req.requestId);
  }

  @Post('admin/:id/publish')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('announcements.update')
  publish(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.announcementsService.setPublished(id, true, req.user, req.requestId);
  }

  @Post('admin/:id/unpublish')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('announcements.update')
  unpublish(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.announcementsService.setPublished(id, false, req.user, req.requestId);
  }

  @Delete('admin/:id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('announcements.delete')
  softDelete(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.announcementsService.softDelete(id, req.user, req.requestId);
  }

  @Post('admin/:id/restore')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('announcements.restore')
  restore(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.announcementsService.restore(id, req.user, req.requestId);
  }
}
