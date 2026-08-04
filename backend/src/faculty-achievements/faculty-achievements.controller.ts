import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { FacultyAchievementType } from '@prisma/client';
import { FacultyAchievementsService } from './faculty-achievements.service';
import {
  CreateFacultyAchievementDto,
  UpdateFacultyAchievementDto,
  ReorderFacultyAchievementsDto,
} from './dto/faculty-achievement.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { RequirePermission } from '../auth/permission.decorator';

/**
 * Gated on the `faculty.*` permissions rather than a module of its own: these
 * are edited from the faculty form, and whoever may edit a faculty member's
 * details is exactly who should be recording their publications.
 */
@ApiTags('faculty-achievements')
@Controller('faculty-achievements')
export class FacultyAchievementsController {
  constructor(private readonly service: FacultyAchievementsService) {}

  @Get()
  findAllPublic(
    @Query('facultyId') facultyId?: string,
    @Query('type') type?: FacultyAchievementType,
  ) {
    return this.service.findAllPublic(
      facultyId ? parseInt(facultyId) : undefined,
      type,
    );
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('faculty.view')
  findAllAdmin(
    @Query('facultyId') facultyId?: string,
    @Query('includeDeleted') includeDeleted?: string,
  ) {
    return this.service.findAllAdmin(
      facultyId ? parseInt(facultyId) : undefined,
      includeDeleted === 'true',
    );
  }

  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('faculty.create')
  create(@Body() dto: CreateFacultyAchievementDto, @Request() req) {
    return this.service.create(dto, req.user, req.requestId);
  }

  // Before @Patch(':id'), or "reorder" is parsed as a record id.
  @Patch('reorder')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('faculty.update')
  reorder(@Body() dto: ReorderFacultyAchievementsDto, @Request() req) {
    return this.service.reorder(dto, req.user, req.requestId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('faculty.update')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateFacultyAchievementDto,
    @Request() req,
  ) {
    return this.service.update(id, dto, req.user, req.requestId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('faculty.delete')
  remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.service.remove(id, req.user, req.requestId);
  }

  @Post(':id/restore')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('faculty.restore')
  restore(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.service.restore(id, req.user, req.requestId);
  }
}
