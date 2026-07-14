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
import { LabsService } from './labs.service';
import { CreateLabDto } from './dto/create-lab.dto';
import { UpdateLabDto } from './dto/update-lab.dto';
import { ReorderLabsDto } from './dto/reorder-labs.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { RequirePermission } from '../auth/permission.decorator';
import { DepartmentOwnershipGuard } from '../auth/department-ownership.guard';
import { DepartmentScoped } from '../auth/department-scope.decorator';

@ApiTags('labs')
@Controller('labs')
export class LabsController {
  constructor(private readonly labsService: LabsService) {}

  @Get()
  findAllPublic(@Query('departmentId', ParseIntPipe) departmentId: number) {
    return this.labsService.findAllPublic(departmentId);
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('labs.view')
  findAllAdmin(
    @Query('departmentId') departmentId?: string,
    @Query('includeDeleted') includeDeleted?: string,
  ) {
    return this.labsService.findAllAdmin(
      departmentId ? parseInt(departmentId) : undefined,
      includeDeleted === 'true',
    );
  }

  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard, DepartmentOwnershipGuard)
  @RequirePermission('labs.create')
  @DepartmentScoped({ source: 'body' })
  create(@Body() dto: CreateLabDto, @Request() req) {
    return this.labsService.create(dto, req.user, req.requestId);
  }

  @Patch('reorder')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('labs.update')
  reorder(@Body() dto: ReorderLabsDto, @Request() req) {
    return this.labsService.reorder(dto, req.user, req.requestId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard, DepartmentOwnershipGuard)
  @RequirePermission('labs.update')
  @DepartmentScoped({ source: 'lookup', model: 'lab' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateLabDto,
    @Request() req,
  ) {
    return this.labsService.update(id, dto, req.user, req.requestId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard, DepartmentOwnershipGuard)
  @RequirePermission('labs.delete')
  @DepartmentScoped({ source: 'lookup', model: 'lab' })
  softDelete(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.labsService.softDelete(id, req.user, req.requestId);
  }

  @Post(':id/restore')
  @UseGuards(JwtAuthGuard, PermissionsGuard, DepartmentOwnershipGuard)
  @RequirePermission('labs.restore')
  @DepartmentScoped({ source: 'lookup', model: 'lab' })
  restore(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.labsService.restore(id, req.user, req.requestId);
  }
}
