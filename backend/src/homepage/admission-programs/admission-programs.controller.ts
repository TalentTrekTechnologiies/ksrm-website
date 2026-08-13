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
import { AdmissionProgramsService } from './admission-programs.service';
import { CreateAdmissionProgramDto } from './dto/create-admission-program.dto';
import type { AdmissionProgramSection } from './dto/create-admission-program.dto';
import { UpdateAdmissionProgramDto } from './dto/update-admission-program.dto';
import { ReorderAdmissionProgramsDto } from './dto/reorder-admission-programs.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { PermissionsGuard } from '../../auth/permissions.guard';
import { RequirePermission } from '../../auth/permission.decorator';

@ApiTags('homepage-admission-programs')
@Controller('homepage')
export class AdmissionProgramsController {
  constructor(
    private readonly admissionProgramsService: AdmissionProgramsService,
  ) {}

  @Get('admission-programs')
  findAllPublic(@Query('section') section: AdmissionProgramSection) {
    return this.admissionProgramsService.findAllPublic(section);
  }

  @Get('admin/admission-programs')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('homepage.view')
  findAllAdmin(
    @Query('section') section?: AdmissionProgramSection,
    @Query('includeDeleted') includeDeleted?: string,
  ) {
    return this.admissionProgramsService.findAllAdmin(
      section,
      includeDeleted === 'true',
    );
  }

  @Post('admin/admission-programs')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('homepage.edit')
  create(@Body() dto: CreateAdmissionProgramDto, @Request() req) {
    return this.admissionProgramsService.create(dto, req.user, req.requestId);
  }

  @Patch('admin/admission-programs/reorder')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('homepage.edit')
  reorder(@Body() dto: ReorderAdmissionProgramsDto, @Request() req) {
    return this.admissionProgramsService.reorder(dto, req.user, req.requestId);
  }

  @Patch('admin/admission-programs/:id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('homepage.edit')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAdmissionProgramDto,
    @Request() req,
  ) {
    return this.admissionProgramsService.update(
      id,
      dto,
      req.user,
      req.requestId,
    );
  }

  @Delete('admin/admission-programs/:id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('homepage.delete')
  softDelete(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.admissionProgramsService.softDelete(
      id,
      req.user,
      req.requestId,
    );
  }

  @Post('admin/admission-programs/:id/restore')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('homepage.restore')
  restore(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.admissionProgramsService.restore(id, req.user, req.requestId);
  }
}
