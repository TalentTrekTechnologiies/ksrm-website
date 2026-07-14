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
import { DepartmentsService } from './departments.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { RequirePermission } from '../auth/permission.decorator';
import { DepartmentOwnershipGuard } from '../auth/department-ownership.guard';
import { DepartmentScoped } from '../auth/department-scope.decorator';

// Real Department profile entity - not the homepage teaser cards at
// ../homepage/departments. See departments.service.ts's doc comment.
@ApiTags('departments')
@Controller('departments')
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Get()
  findAllPublic() {
    return this.departmentsService.findAllPublic();
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('departments.view')
  findAllAdmin(@Query('includeDeleted') includeDeleted?: string) {
    return this.departmentsService.findAllAdmin(includeDeleted === 'true');
  }

  @Get('admin/:id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('departments.view')
  findByIdAdmin(@Param('id', ParseIntPipe) id: number) {
    return this.departmentsService.findByIdAdmin(id);
  }

  @Get(':slug')
  findBySlug(@Param('slug') slug: string) {
    return this.departmentsService.findBySlug(slug);
  }

  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('departments.create')
  create(@Body() dto: CreateDepartmentDto, @Request() req) {
    return this.departmentsService.create(dto, req.user, req.requestId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard, DepartmentOwnershipGuard)
  @RequirePermission('departments.update')
  @DepartmentScoped({ source: 'self' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDepartmentDto,
    @Request() req,
  ) {
    return this.departmentsService.update(id, dto, req.user, req.requestId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard, DepartmentOwnershipGuard)
  @RequirePermission('departments.delete')
  @DepartmentScoped({ source: 'self' })
  softDelete(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.departmentsService.softDelete(id, req.user, req.requestId);
  }

  @Post(':id/restore')
  @UseGuards(JwtAuthGuard, PermissionsGuard, DepartmentOwnershipGuard)
  @RequirePermission('departments.restore')
  @DepartmentScoped({ source: 'self' })
  restore(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.departmentsService.restore(id, req.user, req.requestId);
  }
}
