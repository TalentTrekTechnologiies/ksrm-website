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
import { FacultyService } from './faculty.service';
import { CreateFacultyDto } from './dto/create-faculty.dto';
import { UpdateFacultyDto } from './dto/update-faculty.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { RequirePermission } from '../auth/permission.decorator';
import { ReorderFacultyDto } from './dto/reorder-faculty.dto';
import { DepartmentOwnershipGuard } from '../auth/department-ownership.guard';
import { DepartmentScoped } from '../auth/department-scope.decorator';

@ApiTags('faculty')
@Controller('faculty')
export class FacultyController {
  constructor(private readonly facultyService: FacultyService) {}

  @Get()
  findAll(
    @Query('department') department?: string,
    @Query('departmentId') departmentId?: string,
  ) {
    return this.facultyService.findAll(
      department,
      departmentId ? parseInt(departmentId) : undefined,
    );
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('faculty.view')
  findAllAdmin(
    @Query('includeDeleted') includeDeleted?: string,
    @Query('departmentId') departmentId?: string,
  ) {
    return this.facultyService.findAllAdmin(
      includeDeleted === 'true',
      departmentId ? parseInt(departmentId) : undefined,
    );
  }

  @Get('hod/:department')
  findHod(@Param('department') department: string) {
    return this.facultyService.findHodByDepartment(department);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.facultyService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard, DepartmentOwnershipGuard)
  @RequirePermission('faculty.create')
  @DepartmentScoped({ source: 'body' })
  create(@Body() createFacultyDto: CreateFacultyDto, @Request() req) {
    return this.facultyService.create(createFacultyDto, req.user, req.requestId);
  }

  // Declared before @Patch(':id') so Nest does not treat "reorder" as an id.
  @Patch('reorder')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('faculty.update')
  reorder(@Body() dto: ReorderFacultyDto, @Request() req) {
    return this.facultyService.reorder(dto, req.user, req.requestId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard, DepartmentOwnershipGuard)
  @RequirePermission('faculty.update')
  @DepartmentScoped({ source: 'lookup', model: 'faculty' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateFacultyDto: UpdateFacultyDto,
    @Request() req,
  ) {
    return this.facultyService.update(id, updateFacultyDto, req.user, req.requestId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard, DepartmentOwnershipGuard)
  @RequirePermission('faculty.delete')
  @DepartmentScoped({ source: 'lookup', model: 'faculty' })
  delete(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.facultyService.softDelete(id, req.user, req.requestId);
  }

  @Post(':id/restore')
  @UseGuards(JwtAuthGuard, PermissionsGuard, DepartmentOwnershipGuard)
  @RequirePermission('faculty.restore')
  @DepartmentScoped({ source: 'lookup', model: 'faculty' })
  restore(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.facultyService.restore(id, req.user, req.requestId);
  }
}
