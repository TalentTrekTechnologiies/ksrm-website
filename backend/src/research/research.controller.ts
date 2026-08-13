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
import { ResearchService } from './research.service';
import { CreateResearchDto } from './dto/create-research.dto';
import { UpdateResearchDto } from './dto/update-research.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { RequirePermission } from '../auth/permission.decorator';
import { DepartmentOwnershipGuard } from '../auth/department-ownership.guard';
import { DepartmentScoped } from '../auth/department-scope.decorator';

@ApiTags('research')
@Controller('research')
export class ResearchController {
  constructor(private readonly researchService: ResearchService) {}

  @Get()
  findAllPublic(
    @Query('departmentId') departmentId?: string,
    @Query('facultyId') facultyId?: string,
  ) {
    return this.researchService.findAllPublic(
      departmentId ? parseInt(departmentId) : undefined,
      facultyId ? parseInt(facultyId) : undefined,
    );
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('research.view')
  findAllAdmin(
    @Query('departmentId') departmentId?: string,
    @Query('facultyId') facultyId?: string,
  ) {
    return this.researchService.findAllAdmin(
      departmentId ? parseInt(departmentId) : undefined,
      facultyId ? parseInt(facultyId) : undefined,
    );
  }

  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard, DepartmentOwnershipGuard)
  @RequirePermission('research.create')
  @DepartmentScoped({ source: 'body' })
  create(@Body() dto: CreateResearchDto, @Request() req) {
    return this.researchService.create(dto, req.user, req.requestId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard, DepartmentOwnershipGuard)
  @RequirePermission('research.update')
  @DepartmentScoped({ source: 'lookup', model: 'research' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateResearchDto,
    @Request() req,
  ) {
    return this.researchService.update(id, dto, req.user, req.requestId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard, DepartmentOwnershipGuard)
  @RequirePermission('research.delete')
  @DepartmentScoped({ source: 'lookup', model: 'research' })
  delete(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.researchService.delete(id, req.user, req.requestId);
  }
}
