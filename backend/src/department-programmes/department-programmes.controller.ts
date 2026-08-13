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
import { ProgrammeLevel } from '@prisma/client';
import { DepartmentProgrammesService } from './department-programmes.service';
import { CreateDepartmentProgrammeDto } from './dto/create-department-programme.dto';
import { UpdateDepartmentProgrammeDto } from './dto/update-department-programme.dto';
import { ReorderDepartmentProgrammesDto } from './dto/reorder-department-programmes.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { RequirePermission } from '../auth/permission.decorator';
import { DepartmentOwnershipGuard } from '../auth/department-ownership.guard';
import { DepartmentScoped } from '../auth/department-scope.decorator';

@ApiTags('department-programmes')
@Controller('department-programmes')
export class DepartmentProgrammesController {
  constructor(
    private readonly departmentProgrammesService: DepartmentProgrammesService,
  ) {}

  // departmentId is optional so a page can ask for one department's programmes
  // (a department page) OR every department's (the Diploma admissions page,
  // which lists diploma branches college-wide). `level` narrows by
  // UG/PG/PHD/DIPLOMA - previously a required departmentId made a
  // college-wide list impossible without one request per department.
  @Get()
  findAllPublic(
    @Query('departmentId') departmentId?: string,
    @Query('level') level?: ProgrammeLevel,
  ) {
    return this.departmentProgrammesService.findAllPublic(
      departmentId ? parseInt(departmentId, 10) : undefined,
      level,
    );
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('department_programmes.view')
  findAllAdmin(
    @Query('departmentId') departmentId?: string,
    @Query('includeDeleted') includeDeleted?: string,
  ) {
    return this.departmentProgrammesService.findAllAdmin(
      departmentId ? parseInt(departmentId) : undefined,
      includeDeleted === 'true',
    );
  }

  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard, DepartmentOwnershipGuard)
  @RequirePermission('department_programmes.create')
  @DepartmentScoped({ source: 'body' })
  create(@Body() dto: CreateDepartmentProgrammeDto, @Request() req) {
    return this.departmentProgrammesService.create(
      dto,
      req.user,
      req.requestId,
    );
  }

  @Patch('reorder')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('department_programmes.update')
  reorder(@Body() dto: ReorderDepartmentProgrammesDto, @Request() req) {
    return this.departmentProgrammesService.reorder(
      dto,
      req.user,
      req.requestId,
    );
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard, DepartmentOwnershipGuard)
  @RequirePermission('department_programmes.update')
  @DepartmentScoped({ source: 'lookup', model: 'departmentProgramme' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDepartmentProgrammeDto,
    @Request() req,
  ) {
    return this.departmentProgrammesService.update(
      id,
      dto,
      req.user,
      req.requestId,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard, DepartmentOwnershipGuard)
  @RequirePermission('department_programmes.delete')
  @DepartmentScoped({ source: 'lookup', model: 'departmentProgramme' })
  softDelete(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.departmentProgrammesService.softDelete(
      id,
      req.user,
      req.requestId,
    );
  }

  @Post(':id/restore')
  @UseGuards(JwtAuthGuard, PermissionsGuard, DepartmentOwnershipGuard)
  @RequirePermission('department_programmes.restore')
  @DepartmentScoped({ source: 'lookup', model: 'departmentProgramme' })
  restore(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.departmentProgrammesService.restore(
      id,
      req.user,
      req.requestId,
    );
  }
}
