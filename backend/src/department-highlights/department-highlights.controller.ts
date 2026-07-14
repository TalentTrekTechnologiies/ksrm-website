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
import { DepartmentHighlightKind } from '@prisma/client';
import { DepartmentHighlightsService } from './department-highlights.service';
import { CreateDepartmentHighlightDto } from './dto/create-department-highlight.dto';
import { UpdateDepartmentHighlightDto } from './dto/update-department-highlight.dto';
import { ReorderDepartmentHighlightsDto } from './dto/reorder-department-highlights.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { RequirePermission } from '../auth/permission.decorator';
import { DepartmentOwnershipGuard } from '../auth/department-ownership.guard';
import { DepartmentScoped } from '../auth/department-scope.decorator';

@ApiTags('department-highlights')
@Controller('department-highlights')
export class DepartmentHighlightsController {
  constructor(private readonly departmentHighlightsService: DepartmentHighlightsService) {}

  @Get()
  findAllPublic(
    @Query('departmentId', ParseIntPipe) departmentId: number,
    @Query('kind') kind?: DepartmentHighlightKind,
  ) {
    return this.departmentHighlightsService.findAllPublic(departmentId, kind);
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('department_highlights.view')
  findAllAdmin(
    @Query('departmentId') departmentId?: string,
    @Query('includeDeleted') includeDeleted?: string,
  ) {
    return this.departmentHighlightsService.findAllAdmin(
      departmentId ? parseInt(departmentId) : undefined,
      includeDeleted === 'true',
    );
  }

  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard, DepartmentOwnershipGuard)
  @RequirePermission('department_highlights.create')
  @DepartmentScoped({ source: 'body' })
  create(@Body() dto: CreateDepartmentHighlightDto, @Request() req) {
    return this.departmentHighlightsService.create(dto, req.user, req.requestId);
  }

  @Patch('reorder')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('department_highlights.update')
  reorder(@Body() dto: ReorderDepartmentHighlightsDto, @Request() req) {
    return this.departmentHighlightsService.reorder(dto, req.user, req.requestId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard, DepartmentOwnershipGuard)
  @RequirePermission('department_highlights.update')
  @DepartmentScoped({ source: 'lookup', model: 'departmentHighlight' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDepartmentHighlightDto,
    @Request() req,
  ) {
    return this.departmentHighlightsService.update(id, dto, req.user, req.requestId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard, DepartmentOwnershipGuard)
  @RequirePermission('department_highlights.delete')
  @DepartmentScoped({ source: 'lookup', model: 'departmentHighlight' })
  softDelete(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.departmentHighlightsService.softDelete(id, req.user, req.requestId);
  }

  @Post(':id/restore')
  @UseGuards(JwtAuthGuard, PermissionsGuard, DepartmentOwnershipGuard)
  @RequirePermission('department_highlights.restore')
  @DepartmentScoped({ source: 'lookup', model: 'departmentHighlight' })
  restore(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.departmentHighlightsService.restore(id, req.user, req.requestId);
  }
}
