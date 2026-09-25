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
import { SyllabusService } from './syllabus.service';
import {
  CreateSyllabusProgrammeDto,
  UpdateSyllabusProgrammeDto,
  CreateSyllabusRegulationDto,
  UpdateSyllabusRegulationDto,
  ReorderSyllabusDto,
} from './dto/syllabus.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { RequirePermission } from '../auth/permission.decorator';

/**
 * Routes are ordered so the literal paths ('reorder') are declared before the
 * ':id' patterns that would otherwise swallow them - the same ordering every
 * other controller with a reorder endpoint uses.
 */
@ApiTags('syllabus')
@Controller('syllabus-programmes')
export class SyllabusController {
  constructor(private readonly syllabus: SyllabusService) {}

  @Get()
  findAllPublic() {
    return this.syllabus.findAllPublic();
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('syllabus_programmes.view')
  findAllAdmin(@Query('includeDeleted') includeDeleted?: string) {
    return this.syllabus.findAllAdmin(includeDeleted === 'true');
  }

  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('syllabus_programmes.create')
  createProgramme(@Body() dto: CreateSyllabusProgrammeDto, @Request() req) {
    return this.syllabus.createProgramme(dto, req.user, req.requestId);
  }

  @Patch('reorder')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('syllabus_programmes.update')
  reorderProgrammes(@Body() dto: ReorderSyllabusDto, @Request() req) {
    return this.syllabus.reorderProgrammes(dto, req.user, req.requestId);
  }

  @Post(':programmeId/regulations')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('syllabus_programmes.create')
  createRegulation(
    @Param('programmeId', ParseIntPipe) programmeId: number,
    @Body() dto: CreateSyllabusRegulationDto,
    @Request() req,
  ) {
    return this.syllabus.createRegulation(
      programmeId,
      dto,
      req.user,
      req.requestId,
    );
  }

  @Patch(':programmeId/regulations/reorder')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('syllabus_programmes.update')
  reorderRegulations(
    @Param('programmeId', ParseIntPipe) programmeId: number,
    @Body() dto: ReorderSyllabusDto,
    @Request() req,
  ) {
    return this.syllabus.reorderRegulations(
      programmeId,
      dto,
      req.user,
      req.requestId,
    );
  }

  @Patch('regulations/:id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('syllabus_programmes.update')
  updateRegulation(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSyllabusRegulationDto,
    @Request() req,
  ) {
    return this.syllabus.updateRegulation(id, dto, req.user, req.requestId);
  }

  @Delete('regulations/:id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('syllabus_programmes.delete')
  deleteRegulation(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.syllabus.deleteRegulation(id, req.user, req.requestId);
  }

  @Post('regulations/:id/restore')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('syllabus_programmes.restore')
  restoreRegulation(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.syllabus.restoreRegulation(id, req.user, req.requestId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('syllabus_programmes.update')
  updateProgramme(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSyllabusProgrammeDto,
    @Request() req,
  ) {
    return this.syllabus.updateProgramme(id, dto, req.user, req.requestId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('syllabus_programmes.delete')
  deleteProgramme(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.syllabus.deleteProgramme(id, req.user, req.requestId);
  }

  @Post(':id/restore')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('syllabus_programmes.restore')
  restoreProgramme(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.syllabus.restoreProgramme(id, req.user, req.requestId);
  }
}
